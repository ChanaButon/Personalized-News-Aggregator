# Personalized-News-Aggregator

### RabbitMQ Setup
- RabbitMQ is used as the message broker for the Dapr pub/sub system.
- To run RabbitMQ locally, use `docker-compose up -d`.

### Testing Pub/Sub
- Publish a message to the `news-updates` topic using the News Aggregation service.
- Check the Notification service logs to verify message receipt.
