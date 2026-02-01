# Commit Craft Server

Backend API for the Commit Craft application.

## Features

- **Generate Commit Messages**: AI-powered commit message generation from git diffs
- **Analyze Commit Messages**: Get feedback and scores on commit message quality
- **Commit History**: Track and retrieve previously generated commit messages

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Generate Commit Message
```
POST /api/commits/generate
Content-Type: application/json

{
  "diff": "string (required)",
  "context": "string (optional)",
  "type": "conventional" | "descriptive" | "concise" (optional, default: "conventional")
}
```

### Analyze Commit Message
```
POST /api/commits/analyze
Content-Type: application/json

{
  "message": "string (required)"
}
```

### Get Commit History
```
GET /api/commits/history?limit=10
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `OPENAI_API_KEY`: Your OpenAI API key (for AI features)

## Tech Stack

- Node.js
- Express
- TypeScript
- Zod (validation)
- Helmet (security)
- CORS
- Morgan (logging)
