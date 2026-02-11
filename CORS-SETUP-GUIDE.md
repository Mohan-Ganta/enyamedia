# S3 CORS Setup Guide for EnyaMedia

## Issue
You're getting a CORS error when trying to play videos:
```
Access to video at 'https://bucket-s3-triaright.s3.ap-south-1.amazonaws.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution
You need to configure CORS (Cross-Origin Resource Sharing) on your S3 bucket to allow your web application to access the video files.

## Step-by-Step Setup

### 1. Go to AWS S3 Console
1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket: **bucket-s3-triaright**

### 2. Navigate to Permissions
1. Click on the **"Permissions"** tab
2. Scroll down to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**

### 3. Add CORS Configuration
Copy and paste this CORS configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://enyamediatv.vercel.app",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": [
      "Content-Range",
      "Content-Length",
      "Content-Type",
      "Accept-Ranges",
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Save Changes
Click **"Save changes"**

## What This Configuration Does

- **AllowedOrigins**: Allows access from your local development server and production domain
- **AllowedMethods**: Permits GET and HEAD requests (needed for video streaming)
- **AllowedHeaders**: Allows all headers (including Range headers for video seeking)
- **ExposeHeaders**: Makes important headers available to the browser
- **MaxAgeSeconds**: Caches CORS preflight requests for 1 hour

## Alternative: Use Streaming Proxy (Recommended)

I've already updated your application to use a streaming proxy instead of direct S3 access. This approach:

1. **Avoids CORS issues entirely** - All video requests go through your API
2. **Better security** - S3 URLs are not exposed to the client
3. **More control** - You can add authentication, analytics, etc.

The video player now uses `/api/videos/{id}/stream` instead of direct S3 URLs.

## Verification

After setting up CORS (or using the streaming proxy):

1. Refresh your video page
2. The video should now play without CORS errors
3. Check browser console - no more CORS error messages

## Troubleshooting

If videos still don't play:

1. **Check browser console** for any remaining errors
2. **Verify bucket policy** allows public read access
3. **Test direct S3 URL** in a new browser tab
4. **Clear browser cache** and try again

## Production Security

For production, consider:

1. **Restrict origins** to only your actual domains
2. **Use CloudFront CDN** for better performance
3. **Implement authentication** for private videos
4. **Monitor access logs** for security

## Current Status

✅ **Streaming proxy implemented** - Videos now use `/api/videos/{id}/stream`  
✅ **Direct S3 URLs removed** - No more CORS issues from client-side  
✅ **Quality controls working** - Adaptive streaming through proxy  
⚠️ **CORS setup optional** - Only needed if you want direct S3 access  

Your videos should now work without CORS issues!