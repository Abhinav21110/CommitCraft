# Commit Craft Server

Production-ready backend API for the Commit Craft application with GitHub OAuth, automated repository management, and AI-powered commit scheduling.

## 🚀 Features

### Core Features
- **GitHub OAuth Authentication**: Secure user authentication via GitHub
- **Repository Management**: Create, sync, and manage GitHub repositories
- **AI-Powered Commits**: Gemini AI generates intelligent commit messages
- **Automated Scheduling**: Periodic commits based on user-defined schedules
- **JWT Authentication**: Secure API endpoints with JWT tokens
- **Database Persistence**: SQLite database with Prisma ORM

### Scheduling System
- **Flexible Schedules**: Hourly, daily, weekly, or custom cron expressions
- **Batch Commits**: Configure multiple commits per scheduled run
- **Smart Generation**: AI generates realistic code changes and commit messages
- **Toggle Control**: Enable/disable schedules on demand

## 📋 Prerequisites

- Node.js 18+ and npm
- GitHub OAuth App (create at https://github.com/settings/developers)
- Google Gemini API key (get from https://makersuite.google.com/app/apikey)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080

# Database
DATABASE_URL="file:./dev.db"

# Session & JWT Secrets (change in production!)
SESSION_SECRET=your_super_secret_session_key_change_in_production
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialize Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### `GET /api/auth/github`
Initiates GitHub OAuth flow

#### `GET /api/auth/github/callback`
GitHub OAuth callback (redirects to frontend with JWT token)

#### `GET /api/auth/me`
Get current authenticated user
- **Auth**: Bearer token required
- **Response**: User profile

#### `POST /api/auth/logout`
Logout (client-side token removal)

### Health Check

#### `GET /api/health`
Server health status
- **Response**: `{ status, timestamp, uptime, environment }`

### Repositories

All repo endpoints require `Authorization: Bearer <token>` header

#### `POST /api/repos`
Create a new GitHub repository
```json
{
  "name": "my-new-repo",
  "description": "Optional description",
  "private": false,
  "autoInit": true
}
```

#### `GET /api/repos`
List all user repositories

#### `GET /api/repos/sync`
Sync repositories from GitHub to database

#### `GET /api/repos/:id`
Get repository details with commits and schedules

#### `DELETE /api/repos/:id`
Delete repository from database (not from GitHub)

#### `POST /api/repos/commits`
Create a commit
```json
{
  "repoId": "uuid",
  "message": "Optional commit message (AI-generated if omitted)",
  "files": [
    {
      "path": "README.md",
      "content": "# Hello World"
    }
  ],
  "branch": "main"
}
```

### Commit Schedules

All schedule endpoints require `Authorization: Bearer <token>` header

#### `POST /api/schedules`
Create a commit schedule
```json
{
  "repoId": "uuid",
  "frequency": "daily",
  "commitsPerRun": 3,
  "cronExpression": "0 9 * * *"
}
```

Frequency options:
- `hourly`: Every hour
- `daily`: Every day at 9 AM
- `weekly`: Every Monday at 9 AM
- `custom`: Use custom cron expression

#### `GET /api/schedules`
List all user schedules

#### `GET /api/schedules/:id`
Get schedule details

#### `PUT /api/schedules/:id`
Update schedule configuration

#### `DELETE /api/schedules/:id`
Delete schedule (stops cron job)

#### `POST /api/schedules/:id/toggle`
Toggle schedule enabled/disabled

### Commit Messages

#### `POST /api/commits/generate`
Generate AI commit messages
```json
{
  "diff": "git diff output",
  "context": "Optional context",
  "type": "conventional"
}
```

Types: `conventional`, `descriptive`, `concise`

#### `POST /api/commits/analyze`
Analyze commit message quality
```json
{
  "message": "feat: add new feature"
}
```

#### `GET /api/commits/history?limit=10`
Get commit history

## 🗄️ Database Schema

### User
- GitHub OAuth credentials
- Access tokens (encrypted in production)
- User profile information

### Repo
- GitHub repository metadata
- Links to user
- Tracks commits and schedules

### Commit
- Commit messages and metadata
- Status tracking (pending/committed/failed)
- Scheduling information

### CommitSchedule
- Cron configuration
- Frequency and timing
- Enable/disable control
- Last run and next run timestamps

## 🔐 Security Notes

### Production Checklist
- [ ] Change `SESSION_SECRET` and `JWT_SECRET` to strong random values
- [ ] Use PostgreSQL or MySQL instead of SQLite
- [ ] Encrypt GitHub access tokens in database
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set secure cookie flags
- [ ] Rate limit API endpoints
- [ ] Add request validation and sanitization
- [ ] Implement refresh token rotation
- [ ] Add logging and monitoring

## 🧪 Development

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📚 Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Authentication**: Passport.js + JWT
- **Scheduling**: node-cron
- **AI**: Google Gemini API
- **GitHub API**: Octokit
- **Validation**: Zod

## 🔄 Workflow

1. User authenticates via GitHub OAuth
2. JWT token issued to client
3. User creates/syncs repositories
4. User creates commit schedule for a repo
5. Scheduler runs at configured intervals
6. AI generates code changes and commit messages
7. Commits pushed to GitHub automatically
8. Commit history tracked in database

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not configured"
Get your API key from https://makersuite.google.com/app/apikey

### GitHub OAuth not working
1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
2. Check callback URL matches OAuth app settings
3. Ensure scopes include: `user:email`, `repo`, `write:repo_hook`

### Schedules not running
1. Check schedule is enabled: `GET /api/schedules/:id`
2. Verify cron expression is valid
3. Check server logs for errors
4. Ensure repo has valid GitHub access token
