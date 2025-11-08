# Serverless API Project

This is a serverless project using Node.js and Serverless Framework 3.x that can be invoked via API Gateway.

## Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with your credentials
- Serverless Framework

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy to AWS:
   ```bash
   npx serverless deploy
   ```

## API Endpoints

- GET /hello - Returns a hello message with the event data

## Local Development

To test the function locally:
```bash
npx serverless invoke local -f hello
```

## Deployment

The service will be deployed to AWS using the following command:
```bash
npx serverless deploy
```

After deployment, you'll receive the API Gateway endpoint URL that you can use to invoke your function.
