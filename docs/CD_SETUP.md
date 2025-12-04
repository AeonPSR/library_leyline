# CD Pipeline Setup Guide

## Exercise 6 - Continuous Deployment

This project uses **Google Cloud Run** for deployment (alternative to Ansible as requested).

## Features ✅

- ✅ Automatic deployment on push to master
- ✅ Docker containerization
- ✅ Health check verification (`/api/health`)
- ✅ Production smoke tests
- ✅ Automatic rollback on failure
- ✅ Cloud Run logging integration
- ✅ Deployment summaries

## Prerequisites

### 1. Google Cloud Project Setup

1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable the following APIs:
   - Cloud Run API
   - Container Registry API
   - Cloud Logging API

3. Create a service account:
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name "GitHub Actions Deployer"
   ```

4. Grant necessary permissions:
   ```bash
   PROJECT_ID="your-project-id"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

5. Create and download the service account key:
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
   ```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

1. **GCP_PROJECT_ID**
   - Value: Your Google Cloud project ID (e.g., `library-website-123456`)

2. **GCP_SA_KEY**
   - Value: The entire contents of the `key.json` file you downloaded
   - Copy the full JSON including the curly braces

## Deployment Workflow

The CD pipeline (`deploy.yml`) runs automatically when:
- Code is pushed to the `master` branch
- Or manually triggered via GitHub Actions UI

### Workflow Steps:

1. **Build Docker Image** - Creates container from Dockerfile
2. **Push to GCR** - Uploads to Google Container Registry
3. **Deploy to Cloud Run** - Deploys container to Cloud Run
4. **Health Check** - Verifies `/api/health` endpoint (5 retries)
5. **Smoke Tests** - Tests homepage and API accessibility
6. **View Logs** - Shows recent Cloud Run logs
7. **Rollback** - Automatically reverts on failure

## Health Check Endpoint

The application includes a health check at `/api/health`:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "service": "library-website",
  "database": "connected",
  "version": "1.0.0"
}
```

Returns:
- `200 OK` when healthy
- `503 Service Unavailable` when unhealthy

## Testing Locally with Docker

Build and run the Docker container locally:

```bash
# Build
docker build -t library-website .

# Run
docker run -p 3000:3000 library-website

# Test health check
curl http://localhost:3000/api/health
```

## Monitoring and Logs

### View logs in Google Cloud Console:
https://console.cloud.google.com/run → Select service → Logs

### View logs via CLI:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=library-website" \
  --limit 100 \
  --format json
```

### Tail logs in real-time:
```bash
gcloud alpha logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=library-website"
```

## Manual Deployment

Trigger deployment manually via GitHub Actions:
1. Go to **Actions** tab
2. Select **CD Pipeline - Deploy to Production**
3. Click **Run workflow**
4. Select `master` branch
5. Click **Run workflow** button

## Rollback

If a deployment fails, the workflow automatically rolls back to the previous version.

To manually rollback:
```bash
gcloud run services update-traffic library-website \
  --region us-central1 \
  --to-revisions PREVIOUS=100
```

## Environment Variables

The deployment sets:
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

To add more environment variables, update the `deploy.yml` file:
```yaml
--set-env-vars NODE_ENV=production,DATABASE_URL=your-value
```

## Security Notes

- Service account key is stored as GitHub Secret (encrypted)
- Cloud Run service allows unauthenticated access (public website)
- Container runs as non-root user (`nextjs`)
- SQLite database is persisted in `/app/data` volume

## Troubleshooting

### Deployment fails with permission errors
- Verify service account has required roles
- Check that APIs are enabled in Google Cloud

### Health check fails
- Check Cloud Run logs for application errors
- Verify database initialization in `/app/data`

### Build fails
- Test Docker build locally first
- Check that `next.config.mjs` has `output: 'standalone'`

## Cost Estimation

Google Cloud Run pricing (as of 2025):
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **Idle**: No charges when not serving requests

For a small library website, this should stay within the free tier.

## Alternative: PM2 Deployment (SSH-based)

If you prefer traditional VM deployment with PM2 instead of Cloud Run, you can:
1. Use a VPS (DigitalOcean, AWS EC2, etc.)
2. Deploy via SSH in the workflow
3. Use PM2 for process management

Example workflow step:
```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/library-website
      git pull origin master
      npm ci
      npm run build
      pm2 reload ecosystem.config.js --update-env
```

Let me know if you want me to set up the PM2 approach instead!
