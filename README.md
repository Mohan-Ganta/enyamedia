# EnyaMedia Web - Video Management Platform

A comprehensive video management platform built with Next.js, featuring a powerful admin dashboard for video uploading, management, and analytics.

## Features

### 🎥 Video Management
- **Video Upload**: Drag & drop video upload with progress tracking
- **Multiple Formats**: Support for MP4, MPEG, MOV, AVI, WebM
- **Automatic Thumbnails**: Auto-generated video thumbnails
- **Metadata Management**: Title, description, categories, tags
- **Status Tracking**: Processing, ready, failed, deleted states

### 👨‍💼 Admin Dashboard
- **Analytics Dashboard**: Video stats, user metrics, storage usage
- **User Management**: Role-based access control (User, Admin, Super Admin)
- **Activity Logging**: Comprehensive audit trail
- **Video Library**: Search, filter, and manage all videos
- **Real-time Updates**: Live dashboard statistics

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Multi-level permission system
- **Password Hashing**: bcrypt password security
- **Protected Routes**: Admin-only areas

### 📊 Analytics & Monitoring
- **Upload Trends**: Track video upload patterns
- **Storage Analytics**: Monitor disk usage
- **User Activity**: Track user actions and engagement
- **Video Performance**: Views, likes, and engagement metrics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: JWT with bcryptjs
- **File Storage**: AWS S3 (production) / Local storage (development)
- **File Upload**: Custom upload utility with Sharp for image processing
- **UI**: Tailwind CSS, Lucide React icons
- **Forms**: React Hook Form, React Dropzone

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd enyamedia-web
npm install
```

2. **Set up the database and AWS S3**
```bash
# Seed MongoDB with sample data
npx tsx scripts/seed-mongodb.ts

# Test S3 configuration (optional)
npx tsx scripts/test-s3.ts
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**
- Main site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin/login

### Default Login Credentials
- **Admin**: admin@enyamedia.com / admin123
- **User**: user@enyamedia.com / user123

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── layout.tsx         # Admin layout with sidebar
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── videos/            # Video management
│   │   │   ├── page.tsx       # Video list
│   │   │   └── [id]/edit/     # Video editing
│   │   └── login/             # Admin login
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── videos/            # Video management API
│   │   │   ├── upload/        # Video upload endpoint
│   │   │   └── [id]/stream/   # Video streaming
│   │   └── admin/             # Admin-specific APIs
│   ├── browse/                # Public video browsing
│   ├── login/                 # User login
│   ├── signup/                # User registration
│   └── globals.css            # Global styles
├── components/                # Reusable components
│   └── ErrorBoundary.tsx     # Error handling component
├── lib/                       # Utility libraries
│   ├── mongodb.ts            # MongoDB connection
│   ├── types.ts              # TypeScript interfaces
│   ├── auth.ts               # Authentication utilities
│   ├── upload.ts             # File upload utilities
│   └── aws-s3.ts             # AWS S3 integration
└── scripts/
    ├── seed-mongodb.ts       # Database seeding
    └── test-s3.ts            # S3 configuration test
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - List videos (with pagination/search)
- `POST /api/videos/upload` - Upload new video
- `GET /api/videos/[id]` - Get video details
- `PUT /api/videos/[id]` - Update video
- `DELETE /api/videos` - Delete video (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/users` - Update user roles

## Database Schema

### Users Collection
- Authentication and role management
- Supports USER, ADMIN, SUPER_ADMIN roles
- MongoDB ObjectId as primary key

### Videos Collection
- Complete video metadata
- File information and processing status
- S3 storage keys for easy file management
- View counts and engagement metrics
- References to uploader (User ObjectId)

### Activities Collection
- Comprehensive audit logging
- User actions and system events
- Admin activity tracking
- References to users and videos

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx tsx scripts/seed-mongodb.ts` - Seed MongoDB database
- `npx tsx scripts/test-s3.ts` - Test AWS S3 configuration

### Environment Variables
Create `.env` file from the example:
```bash
cp .env.example .env
```

Then update `.env` with your actual values:
```env
# Database (MongoDB Atlas)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# JWT Secret (change this in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# File Upload
MAX_FILE_SIZE=500000000  # 500MB in bytes
UPLOAD_DIR="./public/uploads"

# AWS S3 Configuration (Required for production)
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_CLOUDFRONT_DOMAIN=""  # Optional
```

**⚠️ Important:** Never commit your `.env` file to Git. See [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) for detailed instructions.

## AWS S3 Setup (Required for Production)

This application uses AWS S3 for video storage to avoid Vercel's serverless function size limits (300MB). Here's how to set it up:

### 1. Create AWS S3 Bucket

1. **Log in to AWS Console** and navigate to S3
2. **Create a new bucket**:
   - Choose a unique bucket name (e.g., `your-app-videos`)
   - Select your preferred region (e.g., `us-east-1`)
   - **Uncheck "Block all public access"** (videos need to be publicly accessible)
   - Enable versioning (optional but recommended)

3. **Configure bucket policy** for public read access:
   Go to your bucket → Permissions → Bucket policy and add:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/enyamedia/*"
       }
     ]
   }
   ```
   Note: This only allows public read access to the `enyamedia/` folder.

### 2. Create IAM User

1. **Navigate to IAM** in AWS Console
2. **Create a new user**:
   - Username: `your-app-s3-user`
   - Access type: Programmatic access
3. **Attach policy** with these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:PutObjectAcl"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
4. **Save the Access Key ID and Secret Access Key**

### 3. Configure Environment Variables

Add these to your `.env` file:
```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### 4. Optional: Set up CloudFront CDN

For better performance and global distribution:

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Cache Policy: Managed-CachingOptimized

2. **Add CloudFront domain to environment**:
   ```env
   AWS_CLOUDFRONT_DOMAIN="your-distribution.cloudfront.net"
   ```

### 5. Test Configuration

Run the S3 test script to verify everything is working:
```bash
npx tsx scripts/test-s3.ts
```

This will test upload and delete operations to ensure your configuration is correct.

### S3 File Structure

Videos are organized in S3 with this structure under the EnyaMedia folder:
```
bucket-s3-triaright/
└── enyamedia/
    ├── videos/
    │   └── {userId}/
    │       └── {timestamp}_{random}_{filename}
    └── thumbnails/
        └── {userId}/
            └── {timestamp}_{random}_{filename}_thumbnail.jpg
```

This keeps all EnyaMedia files organized in a separate folder within your existing S3 bucket.

## Deployment

### Vercel Deployment (Recommended)

This application is optimized for Vercel deployment with MongoDB Atlas and AWS S3:

1. **Database Setup**
   - Use MongoDB Atlas (cloud database)
   - Update `DATABASE_URL` in environment variables

2. **AWS S3 Setup**
   - Follow the AWS S3 setup guide above
   - Configure S3 bucket and IAM user

3. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
   JWT_SECRET="your-super-secret-jwt-key"
   MAX_FILE_SIZE=500000000  # 500MB
   AWS_ACCESS_KEY_ID="your-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   AWS_CLOUDFRONT_DOMAIN="your-distribution.cloudfront.net"  # Optional
   ```

4. **Deploy to Vercel**
   ```bash
   npm run build  # Test build locally
   vercel --prod  # Deploy to production
   ```

### File Storage Architecture

- **Development**: Local file storage in `public/uploads/`
- **Production**: AWS S3 with optional CloudFront CDN
- **Automatic fallback**: App detects S3 configuration and switches automatically
- **No payload limits**: S3 handles large video files without Vercel's 300MB limit

### Other Platforms

For other platforms (AWS, Google Cloud, etc.):
1. Set up MongoDB database
2. Configure AWS S3 for file storage
3. Set environment variables
4. Build and deploy:
```bash
npm run build
npm run start
```

### Bundle Size Optimization

The application is optimized for serverless deployment:
- AWS S3 integration eliminates payload size limits
- Sharp image processing is optional in production
- Large files excluded from deployment bundle
- MongoDB driver optimized for serverless
- Automatic S3/local storage switching based on configuration

## Security Considerations

- Change default JWT secret in production
- Use HTTPS in production
- Implement rate limiting
- Set up proper CORS policies
- Regular security audits
- File upload validation and scanning

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
