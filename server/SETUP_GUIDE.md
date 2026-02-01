# Commit Craft - Production Backend Setup Guide

## Quick Start

### 1. GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Commit Craft
   - **Homepage URL**: `http://localhost:8080` (or your frontend URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy `Client ID` and generate `Client Secret`
6. Add these to your `.env` file

### 2. Gemini API Key Setup

1. Go to https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Create a new API key
4. Copy the key to your `.env` file as `GEMINI_API_KEY`

### 3. Installation

```bash
# From the project root
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the server
npm run dev
```

### 4. Test the Setup

```bash
# In a new terminal, test the health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...,"environment":"development"}
```

## Frontend Authentication Flow

### How to Use GitHub OAuth from Frontend

1. **Login Button**: Redirect user to `http://localhost:3000/api/auth/github`
   ```javascript
   window.location.href = 'http://localhost:3000/api/auth/github';
   ```

2. **Handle Callback**: After OAuth, user is redirected to:
   ```
   http://localhost:8080/auth/callback?token=<JWT_TOKEN>
   ```

3. **Store Token**: Extract and store the JWT token
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   localStorage.setItem('authToken', token);
   ```

4. **Use Token**: Include in all API requests
   ```javascript
   fetch('http://localhost:3000/api/repos', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('authToken')}`
     }
   });
   ```

## Example Workflows

### Create a Repository

```bash
curl -X POST http://localhost:3000/api/repos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auto-commit-test",
    "description": "Testing automated commits",
    "private": false
  }'
```

### Schedule Automated Commits

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repoId": "REPO_UUID_FROM_PREVIOUS_STEP",
    "frequency": "hourly",
    "commitsPerRun": 2
  }'
```

### Generate Commit Message

```bash
curl -X POST http://localhost:3000/api/commits/generate \
  -H "Content-Type: application/json" \
  -d '{
    "diff": "- old line\n+ new line",
    "type": "conventional"
  }'
```

## Production Deployment

### Environment Variables (Production)

```env
# Use strong secrets!
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Use PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/commitcraft?schema=public"

# Production URLs
ALLOWED_ORIGINS=https://yourapp.com
GITHUB_CALLBACK_URL=https://api.yourapp.com/api/auth/github/callback

NODE_ENV=production
```

### Deployment Checklist

- [ ] Use PostgreSQL/MySQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set up proper logging (Winston, Pino)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure auto-scaling
- [ ] Set up database backups
- [ ] Add health checks for load balancer
- [ ] Encrypt sensitive data in database
- [ ] Set up CI/CD pipeline
- [ ] Configure firewall rules
- [ ] Add DDoS protection

### Build for Production

```bash
npm run build
npm start
```

## Database Schema Visualization

```
User (GitHub account)
  ├── Repos (Multiple repositories)
  │     ├── Commits (Commit history)
  │     └── CommitSchedules (Automated schedules)
  └── Commits (All user commits)
```

## Cron Expression Examples

```
"0 * * * *"      - Every hour at minute 0
"*/30 * * * *"   - Every 30 minutes
"0 9 * * *"      - Every day at 9:00 AM
"0 9 * * 1"      - Every Monday at 9:00 AM
"0 0 * * 0"      - Every Sunday at midnight
"0 12 * * 1-5"   - Weekdays at noon
```

## API Rate Limits (Production Recommendation)

```
- Auth endpoints: 5 requests/minute per IP
- Repo creation: 10 requests/hour per user
- Commit generation: 50 requests/hour per user
- Other endpoints: 100 requests/hour per user
```

## Security Best Practices

1. **Token Encryption**: Encrypt GitHub tokens in database
2. **Input Validation**: All inputs validated with Zod
3. **SQL Injection**: Protected by Prisma ORM
4. **XSS Protection**: Helmet middleware enabled
5. **CSRF Protection**: Add CSRF tokens for state-changing operations
6. **Secrets Management**: Use environment variables, never commit secrets

## Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: Sentry, DataDog, New Relic
- **Log Management**: Loggly, Papertrail, CloudWatch
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Performance**: Lighthouse, WebPageTest

### Key Metrics to Track
- Request latency
- Error rates
- Active schedules
- Commits per hour
- GitHub API rate limit usage
- Database query performance
- Memory and CPU usage

## Support

For issues or questions:
- Check server logs: `npm run dev` output
- View database: `npm run prisma:studio`
- Test endpoints: Use Postman or curl
- Enable debug mode: Set `DEBUG=*` in environment
