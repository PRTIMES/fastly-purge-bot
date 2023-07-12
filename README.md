# Deploy

```shell
gcloud functions deploy handleFastlyPurgeBot \
  --runtime=nodejs18 \
  --allow-unauthenticated \
  --trigger-http \
  --region=asia-northeast1 \
  --project=<your-project-id>
```
