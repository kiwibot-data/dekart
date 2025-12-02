# Dekart App Engine Deployment

This repository contains the configuration and deployment setup for running [Dekart](https://dekart.xyz/) on Google App Engine. Dekart is a self-hosted alternative to CARTO & Foursquare Studio for your data warehouse, allowing you to create Kepler.gl maps with SQL queries.

## Overview

Dekart is a self-hosted backend for Kepler.gl, built with Golang and React. It connects to your data warehouse, caches query results, and serves them to the frontend for visualization. This deployment is specifically configured for Google Cloud Platform with BigQuery as the data source.

## Features

- 🗺️ **Interactive Maps**: Create shareable map visualizations from SQL queries
- 🔗 **Data Warehouse Integration**: Works with BigQuery, Snowflake, and Wherobots
- 📊 **Real-time Data**: Up-to-date maps from your data warehouse
- 🔒 **Access Control**: Manage data access and sharing permissions
- ☁️ **Cloud Native**: Deployed on Google App Engine with auto-scaling

## Architecture

This deployment uses:
- **Google App Engine Flexible Environment** with custom runtime
- **PostgreSQL** (Cloud SQL) for storing user data and metadata
- **Google Cloud Storage** for caching query results
- **BigQuery** as the primary data source
- **Mapbox** for map rendering

## Prerequisites

- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local development)
- Access to the following GCP services:
  - App Engine
  - Cloud SQL (PostgreSQL)
  - Cloud Storage
  - BigQuery
  - IAM

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd dekart-app-engine
```

### 2. Configure Environment

The project uses environment variables defined in `app.yaml`. Key configurations:

- **Database**: PostgreSQL instance via Cloud SQL
- **Storage**: Google Cloud Storage bucket for query result caching
- **Data Source**: BigQuery project for data queries
- **Maps**: Mapbox token for map rendering

### 3. Deploy to App Engine

```bash
# Deploy using the Makefile
make app-deploy

# Or deploy directly with gcloud
gcloud app deploy app.yaml
```

## Configuration

### Environment Variables

The deployment is configured through environment variables in `app.yaml`:

| Variable | Description | Example |
|----------|-------------|---------|
| `DEKART_POSTGRES_DB` | PostgreSQL database name | `dekart` |
| `DEKART_POSTGRES_USER` | PostgreSQL username | `postgres` |
| `DEKART_POSTGRES_PASSWORD` | PostgreSQL password | `your-password` |
| `DEKART_POSTGRES_HOST` | PostgreSQL host | `172.17.0.1` |
| `DEKART_CLOUD_STORAGE_BUCKET` | GCS bucket for caching | `your-bucket-name` |
| `DEKART_BIGQUERY_PROJECT_ID` | BigQuery project ID | `your-project-id` |
| `DEKART_MAPBOX_TOKEN` | Mapbox API token | `pk.your-token` |
| `DEKART_CORS_ORIGIN` | CORS origin | `*` or your domain |

### Service Account

The deployment uses a service account: `kepler-dakart@kiwibot-atlas.iam.gserviceaccount.com`

Ensure this service account has the following permissions:
- Cloud SQL Client
- Storage Object Admin
- BigQuery Data Viewer
- BigQuery Job User

## Building from Source

If you need to build Dekart from source instead of using the pre-built Docker image, follow these steps to build and push to Google Artifact Registry.

### 1. Create Artifact Registry Repository (one-time setup)

```bash
gcloud artifacts repositories create dekart \
  --repository-format=docker \
  --location=us-central1 \
  --project=kiwibot-atlas
```

### 2. Configure Docker Authentication

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 3. Build the Docker Image

Build from the `dekart` folder with the correct platform for App Engine:

```bash
cd dekart
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:latest .
```

> **Note**: The `--platform linux/amd64` flag is required when building on Apple Silicon (M1/M2/M3) Macs, as App Engine runs on linux/amd64.

### 4. Push to Artifact Registry

```bash
docker push us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:latest
```

### 5. Deploy to App Engine

```bash
cd ..
gcloud app deploy app.yaml
```

### Quick Reference (All Steps)

```bash
# Full build and deploy workflow
cd dekart
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:latest .
docker push us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:latest
cd ..
gcloud app deploy app.yaml
```

### Using Version Tags

Instead of `latest`, you can use version tags for better tracking:

```bash
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:0.19.5 .
docker push us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:0.19.5
```

Then update `Dockerfile` to reference the specific version:
```dockerfile
FROM us-central1-docker.pkg.dev/kiwibot-atlas/dekart/dekart:0.19.5
```

## Monitoring and Maintenance

### Logs

View application logs:
```bash
gcloud app logs tail -s default
```

### Scaling

The deployment uses manual scaling with 1 instance (as Dekart is designed for single-instance operation). To modify:

```yaml
manual_scaling:
   instances: 1  # Adjust as needed
```

### Database Migrations

Dekart automatically handles database migrations on startup. Check the migration files in `dekart/migrations/` for schema changes.

## Security Considerations

- **CORS**: Configure `DEKART_CORS_ORIGIN` to restrict access to specific domains
- **Database**: Use strong passwords and enable SSL for Cloud SQL
- **Storage**: Ensure Cloud Storage bucket has appropriate access controls
- **IAM**: Follow principle of least privilege for service accounts
- **Encryption**: Consider enabling `DEKART_DATA_ENCRYPTION_KEY` for sensitive data

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify Cloud SQL instance is running and accessible
2. **Storage Access**: Check service account permissions for Cloud Storage
3. **BigQuery Access**: Ensure service account has BigQuery permissions
4. **CORS Errors**: Verify `DEKART_CORS_ORIGIN` configuration

### Debug Mode

Enable debug logging by setting:
```yaml
env_variables:
  DEKART_LOG_DEBUG: "1"
```

## Development

For local development:

```bash
cd dekart
# Install dependencies
npm install

# Start development server
npm run dev

# Or run with Docker Compose
docker-compose up
```

## Resources

- [Dekart Documentation](https://dekart.xyz/docs/)
- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Dekart GitHub Repository](https://github.com/dekart-xyz/dekart)
- [Kepler.gl Documentation](https://docs.kepler.gl/)

## License

This project uses Dekart, which is licensed under the GNU Affero General Public License Version 3 (AGPLv3).

[Commercial Licenses Available](https://dekart.xyz/self-hosted/)

## Version

Current version: 1.0.0

See [CHANGELOG.md](CHANGELOG.md) for version history.

