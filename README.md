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

If you need to build Dekart from source instead of using the pre-built Docker image:

### 1. Build the Dekart Application

```bash
cd dekart
# Install dependencies
npm install

# Build the frontend
npm run build

# Build the Go backend
go build -o dekart ./src/server
```

### 2. Create Custom Docker Image

```dockerfile
# Custom Dockerfile for building from source
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY dekart/package*.json ./
RUN npm ci
COPY dekart/src/client ./src/client
COPY dekart/vite.config.js ./
RUN npm run build

FROM golang:1.21-alpine AS backend-builder
WORKDIR /app
COPY dekart/go.mod dekart/go.sum ./
RUN go mod download
COPY dekart/src ./src
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o dekart ./src/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/dekart .
EXPOSE 8080
CMD ["./dekart"]
```

### 3. Deploy Custom Build

```bash
# Build and push to Google Container Registry
docker build -t gcr.io/your-project-id/dekart-custom .
docker push gcr.io/your-project-id/dekart-custom

# Update app.yaml to use custom image
# Then deploy
gcloud app deploy app.yaml
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
