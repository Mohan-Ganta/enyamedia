# Deployment Checklist

## Pre-deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses (or use 0.0.0.0/0 for all IPs)
- [ ] Get connection string
- [ ] Test connection with `npx tsx scripts/seed-mongodb.ts`

### 2. AWS S3 Setup
- [ ] Create S3 bucket with unique name
- [ ] Configure bucket for public read access
- [ ] Create IAM user with S3 permissions
- [ ] Get Access Key ID and Secret Access Key
- [ ] Test S3 configuration with `npx tsx scripts/test-s3.ts`
- [ ] (Optional) Set up CloudFront CDN

### 3. Environment Variables
Set these in your deployment platform:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# File Upload
MAX_FILE_SIZE=500000000  # 500MB

# AWS S3 (Required for production)
AWS_ACCESS_KEY_ID="AKIAW2H2Z6PW7Y5S7YMP"
AWS_SECRET_ACCESS_KEY="your-complete-secret-access-key"  # 40 characters
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="bucket-s3-triaright"
AWS_CLOUDFRONT_DOMAIN=""  # Optional
```

## Vercel Deployment

### 1. Build Test
```bash
npm run build
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Post-deployment
- [ ] Seed database: Access `/api/admin/dashboard` to trigger initial setup
- [ ] Test video upload functionality
- [ ] Verify S3 integration is working
- [ ] Check admin dashboard loads correctly

## Other Platforms

### AWS/Google Cloud/etc.
1. Set up environment variables
2. Build application: `npm run build`
3. Start production server: `npm run start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificate

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   - Run `npm run build` locally first
   - Check all environment variables are set

2. **S3 upload fails**
   - Verify AWS credentials
   - Check bucket permissions
   - Run `npx tsx scripts/test-s3.ts`

3. **Database connection fails**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

4. **Videos don't play**
   - Check S3 bucket public access settings
   - Verify CloudFront configuration (if using)
   - Check CORS settings

### Performance Optimization

1. **Enable CloudFront CDN** for better video delivery
2. **Set up MongoDB indexes** for better query performance
3. **Configure caching headers** for static assets
4. **Monitor S3 costs** and set up lifecycle policies

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting
- [ ] Regular security audits
- [ ] File upload validation and scanning
- [ ] Monitor AWS costs and usage

## Monitoring

Set up monitoring for:
- [ ] Application errors and performance
- [ ] Database performance and connections
- [ ] S3 storage usage and costs
- [ ] Video upload success rates
- [ ] User activity and engagement