# API Documentation

## Authentication

### JWT Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "JOBSEEKER"
  }
}
```

## Job Endpoints

### List Jobs

```http
GET /api/jobs
Authorization: Bearer {token}
```

Query Parameters:
- `page` (integer): Page number
- `limit` (integer): Items per page
- `query` (string): Search query
- `location` (string): Location filter
- `type` (string): Job type
- `minSalary` (number): Minimum salary
- `skills` (array): Required skills

### Create Job

```http
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Software Engineer",
  "description": "Job description...",
  "location": "New York, NY",
  "type": "FULL_TIME",
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "skills": ["JavaScript", "React", "Node.js"],
  "requirements": "Requirements..."
}
```

### Update Job

```http
PUT /api/jobs/{jobId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  ...
}
```

### Delete Job

```http
DELETE /api/jobs/{jobId}
Authorization: Bearer {token}
```

## Application Endpoints

### Submit Application

```http
POST /api/applications
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "jobId": "123",
  "coverLetter": "Cover letter text...",
  "resume": File
}
```

### List Applications

```http
GET /api/applications
Authorization: Bearer {token}
```

## User Endpoints

### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "title": "Software Engineer",
  "skills": ["JavaScript", "React"],
  "experience": []
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- Default: 100 requests per 15 minutes
- Authenticated: 1000 requests per 15 minutes
- Job creation: 50 per day per company

## Versioning

API version is included in the URL:
```http
GET /api/v1/jobs
```

## Pagination

Response format for paginated endpoints:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Testing

Test endpoints with provided Postman collection:
```bash
# Import collection
postman import job-platform-api.postman_collection.json
```

## WebSocket API

Connect to real-time updates:
```javascript
const ws = new WebSocket('ws://api.example.com/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle updates
};
```

## API Clients

Sample API client usage:
```javascript
import { JobPlatformClient } from '@job-platform/client';

const client = new JobPlatformClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.example.com'
});

const jobs = await client.jobs.list({
  query: 'developer',
  location: 'Remote'
});
```

