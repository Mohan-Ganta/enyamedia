# S3 Bucket Policy Setup for EnyaMedia

## Quick Setup Steps

Your S3 upload failed because the bucket doesn't allow ACLs, but I've fixed the code. Now you need to set up a bucket policy to allow public read access to your videos.

### Step 1: Go to AWS S3 Console
1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Find and click on your bucket: `bucket-s3-triaright`

### Step 2: Set Bucket Policy
1. Click on the **"Permissions"** tab
2. Scroll down to **"Bucket policy"** section
3. Click **"Edit"**
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-s3-triaright/enyamedia/*"
    }
  ]
}
```

5. Click **"Save changes"**

### What This Does
- Allows public read access ONLY to files in the `enyamedia/` folder
- Other files in your bucket remain private
- Videos can be streamed directly from S3 URLs
- Thumbnails can be displayed in the web app

### Step 3: Test Upload
After setting the bucket policy, try uploading a video again in your development server. It should work now!

### Verification
Once the policy is set, you can verify it works by:
1. Uploading a video through your app
2. The video should upload successfully to S3
3. You should see the file in your S3 bucket under `enyamedia/videos/`
4. The video should be playable in your app

### Security Note
This policy only allows reading files from the `enyamedia/` folder. Your other files in the bucket remain private and secure.