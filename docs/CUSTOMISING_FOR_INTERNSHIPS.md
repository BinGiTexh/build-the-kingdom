# Customising the Job Platform Template for an Internship Marketplace

The template ships with production-ready job-board features. Transforming it into an **internship-focused** platform typically requires only *configuration* and a handful of new endpoints/pages.

---

## 1  Update Domain Language

| Layer | Default Term | Internship Term |
|-------|--------------|-----------------|
| API models | `Job` | `Internship` |
| Routes | `/jobs` | `/internships` |
| UI labels | “Jobs” | “Internships” |

Steps:
1. Duplicate the `Job` Prisma model → rename to `Internship` (or add `type` enum).
2. Add `duration`, `stipend`, `startDate` fields.
3. Alias controller/service functions (`createInternship`, `listInternships`, …).
4. Search-and-replace front-end strings.

## 2  Candidate Flow Changes

Internships often require:
* **Resume upload** → already supported via file-upload endpoint.
* **Cover-letter** field → extend `Application` model + UI component.
* **Availability dates** → add to application form / DB.

## 3  Employer Workflow

Add UI pages / endpoints for:
* Internship programme creation wizard (can re-use job-posting form with extra fields).
* Batch review of applications per school term.

## 4  Compliance & Eligibility

Certain regions impose minimum wage or credit-for-work rules.
* Add a `complianceChecklist` boolean column and expose in admin dashboard.

## 5  Success Metrics Dashboards

Intern programmes track hire-conversion rates. Create a Grafana/Metabase dashboard fed by the existing audit logs and metrics pipeline.

## 6  Example Git Diff (high-level)

```
packages/api/
  prisma/schema.prisma   # +model Internship
  src/routes/internships.js  # REST endpoints
packages/frontend/
  src/pages/internships/
    List.tsx, Detail.tsx, Apply.tsx
  src/components/forms/InternshipApplicationForm.tsx
```

With these small, well-isolated changes, you retain all the template’s DevOps and scalability advantages while shipping a bespoke internship marketplace in days, not weeks.
