# beerpong
a webapplication to organize and plan beer pong tournaments

export PATH=$(go env GOPATH)/bin:$PATH
swag init --parseDependency --generalInfo cmd/main.go

## Frontend Docker Release Pipeline

The repository now includes a release pipeline for the Angular frontend image:

- Workflow: `.github/workflows/frontend-release.yml`
- Trigger: push a tag starting with `v` (example: `v1.0.0`)
- Build context: `app/ngBeerpong`
- Image target: `DOCKERHUB_USERNAME/beerpong-frontend`
- Deploy strategy: SSH to VPS and run `docker compose pull/up` for frontend service

### Required GitHub Secrets

Set these in repository settings before running the workflow:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_SSH_PORT`
- `VPS_APP_PATH` (path on VPS where your compose file lives, example `/opt/beerpong`)
- `VPS_FRONTEND_SERVICE` (compose service name, example `frontend`)

### VPS Compose Requirements

Your VPS compose file should consume these environment variables:

- `FRONTEND_IMAGE_REPOSITORY`
- `FRONTEND_IMAGE_TAG`

An example service definition is available at `doc/docker-compose.frontend.example.yaml`.

### Secret Scanning

The repository now includes a secret scanning workflow:

- Workflow: `.github/workflows/secret-scan.yml`
- Scanner: `gitleaks`
- Trigger: push to `main` and pull requests

### Release Usage

Create and push a release tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This publishes frontend image tags to Docker Hub and deploys the tagged version to your VPS frontend service.