# S3 CORS Configuration for Video Streaming

If videos are still not playing properly, you may need to configure CORS (Cross-Origin Resource Sharing) on your S3 bucket.

## Setup CORS on S3 Bucket

### Step 1: Go to S3 Bucket Permissions
1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket: `bucket-s3-triaright`
3. Go to the **"Permissions"** tab
4. Scroll down to **"Cross-origin resource sharing (CORS)"**

### Step 2: Add CORS Configuration
Click **"Edit"** and paste this CORS configuration:

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
            "*"
        ],
        "ExposeHeaders": [
            "Content-Range",
            "Content-Length",
            "Content-Type"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Save Changes
Click **"Save changes"**

## What This Does
- Allows your web application to access videos from any domain
- Enables proper video streaming with range requests
- Exposes necessary headers for video playback
- Sets cache duration for CORS preflight requests

## Alternative: Restrict to Your Domain
For better security in production, replace `"*"` in `AllowedOrigins` with your actual domain:

```json
"AllowedOrigins": [
    "http://localhost:3000",
    "https://your-domain.com",
    "https://enyamediatv.vercel.app"
]
```

## Test Video Playback
After setting up CORS:
1. Refresh your video page
2. The video should now play properly
3. Check browser console for any remaining errors

## Troubleshooting
If videos still don't play:
1. Check browser console for CORS errors
2. Verify the S3 URL is accessible directly in a new tab
3. Ensure the bucket policy allows public read access
4. Check if the video file was uploaded correctly to S3