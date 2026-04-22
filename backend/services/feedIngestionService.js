const { Readable } = require('stream');
const prisma = require('../lib/prisma');

const BATCH_SIZE = 5000;
const LOG_INTERVAL = 10000;

class FeedIngestionService {
  transformJob(raw, source = 'appcast') {
    return {
      externalJobId: raw.referencenumber || raw.id || raw.jobId,
      title: raw.title,
      description: raw.description || raw.body || raw.jobDescription || '',
      location: [raw.city, raw.state, raw.country].filter(Boolean).join(', ') || raw.location || 'Remote',
      externalApplyUrl: raw.url || raw.applyUrl || raw.applicationUrl,
      feedSource: source,
      feedImportedAt: new Date(),
      type: this.mapJobType(raw.jobtype || raw.employmentType),
      status: 'ACTIVE',
      salary: this.parseSalary(raw.salary || raw.compensation),
      skills: this.parseSkills(raw.skills || raw.requirements),
      requirements: raw.requirements || raw.qualifications || '',
    };
  }

  parseSalary(salary) {
    if (!salary) return {};
    if (typeof salary === 'object') return salary;
    const numbers = String(salary).match(/\d+/g);
    if (!numbers) return {};
    return {
      min: parseInt(numbers[0]),
      max: parseInt(numbers[1]) || parseInt(numbers[0]),
      currency: process.env.CURRENCY || 'USD'
    };
  }

  mapJobType(type) {
    const map = {
      'full-time': 'FULL_TIME', 'fulltime': 'FULL_TIME',
      'part-time': 'PART_TIME', 'parttime': 'PART_TIME',
      'contract': 'CONTRACT', 'contractor': 'CONTRACT',
      'internship': 'INTERNSHIP', 'intern': 'INTERNSHIP',
      'temporary': 'TEMPORARY', 'temp': 'TEMPORARY',
    };
    return map[type?.toLowerCase()] || 'FULL_TIME';
  }

  parseSkills(skills) {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return skills.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }

  logMemory(label) {
    const used = process.memoryUsage();
    console.log(`[feed] ${label} — heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB, rss: ${Math.round(used.rss / 1024 / 1024)}MB`);
  }

  async bulkUpsertBatch(jobs) {
    if (!jobs.length) return;
    const queries = jobs.map(job =>
      prisma.job.upsert({
        where: { externalJobId: job.externalJobId },
        update: job,
        create: job,
      })
    );
    await prisma.$transaction(queries);
  }

  async ingestXmlStream(readableStream, source, results) {
    const sax = require('sax');
    const saxStream = sax.createStream(true, { trim: true, normalize: true });

    let currentTag = '';
    let currentJob = {};
    let batch = [];
    let depth = 0;
    let jobTag = null;

    const flush = async () => {
      if (!batch.length) return;
      const toWrite = batch.splice(0);
      try {
        await this.bulkUpsertBatch(toWrite);
        results.created += toWrite.length;
      } catch (err) {
        for (const job of toWrite) {
          try {
            await prisma.job.upsert({
              where: { externalJobId: job.externalJobId },
              update: job,
              create: job,
            });
            results.created++;
          } catch (e) {
            results.errors.push({ id: job.externalJobId, error: e.message });
          }
        }
      }
      results.totalProcessed += toWrite.length;
      if (results.totalProcessed % LOG_INTERVAL < BATCH_SIZE) {
        console.log(`[feed] Processed ${results.totalProcessed} jobs...`);
        this.logMemory('progress');
      }
    };

    return new Promise((resolve, reject) => {
      saxStream.on('opentag', (node) => {
        const name = node.name.toLowerCase();
        if (!jobTag && (name === 'job' || name === 'item' || name === 'position')) {
          jobTag = name;
        }
        if (name === jobTag) {
          depth++;
          if (depth === 1) currentJob = {};
        }
        if (depth >= 1) currentTag = name;
      });

      saxStream.on('text', (text) => {
        if (depth >= 1 && currentTag && text.trim()) {
          currentJob[currentTag] = (currentJob[currentTag] || '') + text.trim();
        }
      });

      saxStream.on('cdata', (cdata) => {
        if (depth >= 1 && currentTag) {
          currentJob[currentTag] = (currentJob[currentTag] || '') + cdata;
        }
      });

      saxStream.on('closetag', (name) => {
        const lname = name.toLowerCase();
        if (lname === jobTag) {
          depth--;
          if (depth === 0) {
            const job = this.transformJob(currentJob, source);
            if (job.externalJobId) {
              batch.push(job);
              if (batch.length >= BATCH_SIZE) {
                readableStream.pause();
                flush().then(() => readableStream.resume()).catch(reject);
              }
            } else {
              results.errors.push({ error: 'Missing external ID', title: currentJob.title });
            }
            currentJob = {};
          }
        }
        if (depth === 0) currentTag = '';
      });

      saxStream.on('end', () => {
        flush().then(resolve).catch(reject);
      });

      saxStream.on('error', (err) => {
        console.error('[feed] SAX parse error:', err.message);
        flush().then(() => resolve()).catch(reject);
      });

      readableStream.pipe(saxStream);
    });
  }

  async ingestJsonStream(readableStream, source, results) {
    const chunks = [];
    for await (const chunk of readableStream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const text = Buffer.concat(chunks).toString();
    const data = JSON.parse(text);
    const rawJobs = data.jobs || data.results || (Array.isArray(data) ? data : [data]);
    console.log(`[feed] JSON feed: ${rawJobs.length} jobs`);

    for (let i = 0; i < rawJobs.length; i += BATCH_SIZE) {
      const slice = rawJobs.slice(i, i + BATCH_SIZE);
      const batch = [];
      for (const raw of slice) {
        const job = this.transformJob(raw, source);
        if (job.externalJobId) {
          batch.push(job);
        } else {
          results.errors.push({ error: 'Missing external ID', title: raw.title });
        }
      }
      try {
        await this.bulkUpsertBatch(batch);
        results.created += batch.length;
      } catch (err) {
        for (const job of batch) {
          try {
            await prisma.job.upsert({
              where: { externalJobId: job.externalJobId },
              update: job,
              create: job,
            });
            results.created++;
          } catch (e) {
            results.errors.push({ id: job.externalJobId, error: e.message });
          }
        }
      }
      results.totalProcessed += batch.length;
      if (results.totalProcessed % LOG_INTERVAL < BATCH_SIZE) {
        console.log(`[feed] Processed ${results.totalProcessed} jobs...`);
        this.logMemory('progress');
      }
    }
  }

  async ingestFeed(feedUrl, source = 'appcast') {
    console.log(`[feed] Starting ingestion from ${feedUrl}`);
    this.logMemory('start');
    const startTime = Date.now();

    const results = { created: 0, errors: [], totalProcessed: 0 };

    const response = await fetch(feedUrl);
    if (!response.ok) throw new Error(`Feed fetch failed: ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('json');

    const nodeStream = Readable.fromWeb(response.body);

    if (isJson) {
      await this.ingestJsonStream(nodeStream, source, results);
    } else {
      await this.ingestXmlStream(nodeStream, source, results);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[feed] Done: ${results.created} upserted, ${results.errors.length} errors in ${elapsed}s`);
    this.logMemory('end');

    return results;
  }
}

module.exports = new FeedIngestionService();
