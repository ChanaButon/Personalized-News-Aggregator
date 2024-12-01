# Personalized-News-Aggregator

### RabbitMQ Setup
- RabbitMQ is used as the message broker for the Dapr pub/sub system.
- To run RabbitMQ locally, use `docker-compose up -d`.

### Testing Pub/Sub
- Publish a message to the `news-updates` topic using the News Aggregation service.
- Check the Notification service logs to verify message receipt.


Overview

The Personalized News Update Aggregator is a microservice-based system designed to deliver personalized news and technology updates to users. Users can set preferences for news categories, and the system will fetch, summarize, and deliver the most relevant news via email.

System Architecture

-service-user: Manages user profiles and preferences. -service-news: Fetches news articles based on user preferences. -service-notification: Sends news updates via email.

Technologies Used

Backend: Node.js
Frontend: React
Database: MongoDB
Message Queue: RabbitMQ
Containerization: Docker, Docker Compose
Service Communication: Dapr
APIs: NewsData.io.
Setup and Installation

Prerequisites

Install Docker and Docker Compose.

Install Node.js and npm.

Clone this repository:

git 
Navigate to the project directory:

cd news-aggregator
Start the application using Docker Compose:

docker-compose up --build
see the client:

http://localhost:3000


