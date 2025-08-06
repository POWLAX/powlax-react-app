# Vimeo API Setup Instructions

## 1. Get Vimeo API Credentials

1. Go to https://developer.vimeo.com/
2. Click "Create an app" or go to https://developer.vimeo.com/apps
3. Create a new app for POWLAX
4. Once created, go to your app settings

## 2. Generate Access Token

In your Vimeo app dashboard:
1. Go to "Authentication" tab
2. Under "Personal access tokens", click "Generate"
3. Select these scopes:
   - `public` - View public videos
   - `private` - View private videos (if needed)
   - `video_files` - Access video files
   - `stats` - View statistics (optional)

## 3. Add to Environment Variables

Create or update `.env.local` file:

```env
NEXT_PUBLIC_VIMEO_ACCESS_TOKEN=your_access_token_here
VIMEO_CLIENT_ID=your_client_id
VIMEO_CLIENT_SECRET=your_client_secret
```

## 4. Test Your Setup

Run this quick test in your terminal:

```bash
curl -H "Authorization: bearer YOUR_ACCESS_TOKEN" https://api.vimeo.com/me
```

You should see your Vimeo account info if it's working.

## What I'll Use the API For:

1. **Fetch video metadata** - duration, thumbnail, title
2. **Track view progress** - for gamification points
3. **Get video quality options** - for adaptive streaming
4. **Validate video availability** - ensure videos are still accessible

Let me know once you have the access token set up!