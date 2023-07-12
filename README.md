# Deploy

```shell
gcloud functions deploy handleFastlyPurgeBot \
  --runtime=nodejs18 \
  --allow-unauthenticated \
  --trigger-http \
  --region=asia-northeast1 \
  --project=<your-project-id>
```

# Env vars

| Name                 | Description          | Note     |
| :------------------- | :------------------- | :------- |
| SLACK_SIGNING_SECRET | Slack signing secret | required |
| SLACK_BOT_TOKEN      | Slack bot token      | required |
| FASTLY_API_TOKEN     | Fastly API token     | required |
