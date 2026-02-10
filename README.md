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
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer with Sharp for image processing
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

2. **Set up the database**
```bash
npm run setup
```
This will:
- Generate Prisma client
- Create SQLite database
- Run initial migrations
- Seed with admin user

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
│   │   ├── upload/            # Video upload interface
│   │   ├── videos/            # Video management
│   │   ├── users/             # User management
│   │   └── login/             # Admin login
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── videos/            # Video management API
│   │   └── admin/             # Admin-specific APIs
│   └── globals.css            # Global styles
├── components/                # Reusable components
├── lib/                       # Utility libraries
│   ├── prisma.ts             # Database client
│   ├── auth.ts               # Authentication utilities
│   └── upload.ts             # File upload utilities
└── prisma/
    └── schema.prisma         # Database schema
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

### Users
- Authentication and role management
- Supports USER, ADMIN, SUPER_ADMIN roles

### Videos
- Complete video metadata
- File information and processing status
- View counts and engagement metrics

### Activities
- Comprehensive audit logging
- User actions and system events
- Admin activity tracking

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

### Environment Variables
Create `.env.local`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
MAX_FILE_SIZE=100000000
UPLOAD_DIR="./public/uploads"
```

## Deployment

### Production Setup
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Build and deploy:
```bash
npm run build
npm run start
```

### Environment Configuration
- Update `DATABASE_URL` for production database
- Set strong `JWT_SECRET`
- Configure file storage (AWS S3, etc.)
- Set up CDN for video delivery

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
