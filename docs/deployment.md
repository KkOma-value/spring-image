# Deployment Guide

## Requirements

- Node.js 18+
- PostgreSQL 14+
- Stripe Account
- Google Cloud Console Account
- Vercel Account (recommended)

## Environment Setup

### 1. Database

```bash
# Create PostgreSQL database
createdb spring_image

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@localhost:5432/spring_image"
```

### 2. Authentication

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Set environment variables:

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Stripe Setup

1. Create Stripe account
2. Create a product and price
3. Get API keys and webhook secret
4. Configure webhook endpoint: `https://yourdomain.com/api/webhook`

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRICE_ID=price_...
```

### 4. AI Service

Get Gemini API key from [Google AI Studio](https://aistudio.google.com/)

```env
GEMINI_API_KEY=your-api-key
```

### 5. File Storage

Get Vercel Blob token:

```bash
vercel blobs --token
```

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

## Local Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables Summary

```env
# Required
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
NEXT_PUBLIC_BASE_URL=

# Payments (optional, for billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PRICE_ID=

# Storage (optional, for uploads)
BLOB_READ_WRITE_TOKEN=
```

## Post-Deployment

1. Run migrations: `npm run db:migrate`
2. Test authentication flow
3. Test image generation
4. Test payment flow (use Stripe test mode)
5. Monitor logs for errors

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL format |
| Auth not working | Verify BETTER_AUTH_URL matches domain |
| Stripe webhooks failing | Check webhook secret and endpoint URL |
| Image generation failed | Verify GEMINI_API_KEY |
