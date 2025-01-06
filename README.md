# K8S Dynatrace Monitoring

### Start Frontend

```bash
# Build Docker image.
docker build -t multisnake-frontend multisnake-frontend

# Run Container. Webpage will be accessible through localhost:5000
docker run -p 80:5000 multisnake-frontend
```

