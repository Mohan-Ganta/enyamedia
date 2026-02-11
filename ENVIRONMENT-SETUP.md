# Environment Variables Setup Guide

## 🔒 Security Notice

Your `.env` file has been removed from Git tracking to protect sensitive information like database credentials and API keys.

## 📋 Setup Instructions

### 1. Create Your Local Environment File

Copy the example file and add your actual values:

```bash
cp .env.example .env
```

### 2. Update Environment Variables

Edit `.env` with your actual values:

```env
# Database (MongoDB Atlas)
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# File Upload
MAX_FILE_SIZE=500000000  # 500MB in bytes
UPLOAD_DIR="./public/uploads"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_CLOUDFRONT_DOMAIN=""  # Optional
```

### 3. For Team Members

When other developers clone the repository:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Get the actual values** from:
   - Team lead or project manager
   - Secure password manager
   - Development documentation

3. **Never commit** the `.env` file to Git

## 🚀 Deployment Environment Variables

### Vercel Deployment

Set these in your Vercel dashboard under Settings → Environment Variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
MAX_FILE_SIZE=500000000
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain
```

### Other Platforms

For other deployment platforms (AWS, Google Cloud, etc.), set these as environment variables in your deployment configuration.

## 🔐 Security Best Practices

### ✅ Do:
- Use `.env.example` to document required variables
- Keep `.env` in `.gitignore`
- Use different values for development/staging/production
- Rotate secrets regularly
- Use strong, unique JWT secrets

### ❌ Don't:
- Commit `.env` files to Git
- Share credentials in chat/email
- Use production credentials in development
- Hardcode secrets in source code
- Use weak or default passwords

## 🛠️ Generating Secure Secrets

### JWT Secret
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### NextAuth Secret
```bash
# Generate NextAuth secret
openssl rand -base64 32
```

## 📁 File Structure

```
your-project/
├── .env                 # Your local environment (ignored by Git)
├── .env.example         # Template file (committed to Git)
├── .gitignore          # Includes .env patterns
└── ENVIRONMENT-SETUP.md # This guide
```

## 🚨 If Credentials Are Compromised

1. **Immediately rotate** all affected credentials
2. **Update** environment variables in all environments
3. **Review** Git history for any accidentally committed secrets
4. **Notify** team members if necessary

## 📞 Support

If you need help setting up environment variables:
1. Check this guide first
2. Refer to the main README.md
3. Contact the development team
4. Check deployment platform documentation

Remember: **Never commit sensitive information to Git!**