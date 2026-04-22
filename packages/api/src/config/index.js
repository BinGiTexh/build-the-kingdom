const path = require('path');
const fs = require('fs');

const loadRegionConfig = (region = 'default') => {
  const configPath = path.join(__dirname, `../../config/${region}.json`);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      ...config,
      isCustomRegion: region !== 'default'
    };
  } catch (error) {
    console.warn(`Failed to load config for region ${region}, falling back to default`);
    return require('../../config/default.json');
  }
};

module.exports = {
  loadRegionConfig
};

