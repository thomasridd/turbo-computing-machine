# Deployment Guide

## Netlify Deployment

This Receipt Splitter app is configured for easy deployment on Netlify.

### Prerequisites

- A [Netlify](https://www.netlify.com/) account
- Your repository pushed to GitHub, GitLab, or Bitbucket

### Automatic Deployment Steps

1. **Connect to Netlify**
   - Log in to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Choose your Git provider and select this repository

2. **Configure Build Settings**
   - The build settings are automatically configured via `netlify.toml`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

3. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app
   - Your site will be live at a Netlify URL (e.g., `your-site-name.netlify.app`)

### Configuration Details

The `netlify.toml` file includes:
- **Build configuration**: Optimized for Next.js 14
- **Next.js plugin**: Automatic integration with Netlify's Next.js runtime
- **Redirects**: Proper routing for client-side navigation
- **Headers**: Security headers and cache optimization
- **Node version**: Set to Node 20 for compatibility

### Manual Configuration (if needed)

If you need to override the automatic settings:

1. Go to Site settings > Build & deploy > Build settings
2. Set the following:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

### Environment Variables (Optional)

For better OCR accuracy, configure a cloud OCR API. See [OCR_SETUP.md](./OCR_SETUP.md) for detailed instructions.

**Option 1: Google Cloud Vision API (Recommended)**
1. Go to Site settings > Environment variables
2. Add variable:
   - Key: `GOOGLE_CLOUD_VISION_API_KEY`
   - Value: Your Google Cloud Vision API key
3. Redeploy the site

**Option 2: OCR.space API (Free Alternative)**
1. Go to Site settings > Environment variables
2. Add variable:
   - Key: `OCR_SPACE_API_KEY`
   - Value: Your OCR.space API key
3. Redeploy the site

**No API Key?**
- The app works without API keys by using Tesseract.js (lower accuracy)
- See [OCR_SETUP.md](./OCR_SETUP.md) for comparison and setup instructions

### Custom Domain

To use a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Continuous Deployment

Once connected, Netlify will automatically:
- Deploy on every push to your main branch
- Create deploy previews for pull requests
- Run builds in an isolated environment

## Alternative Deployment Options

### Vercel

```bash
npm install -g vercel
vercel
```

### Static Export (Optional)

To export as a static site:

1. Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

2. Build:
```bash
npm run build
```

3. Deploy the `out` directory to any static hosting service

**Note**: Static export may limit some Next.js features like server-side rendering.

## Testing Before Deployment

Always test your build locally:

```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to verify everything works correctly.

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify Node version is compatible (20+)
- Review build logs in Netlify dashboard

### App Doesn't Load

- Check browser console for errors
- Verify Tesseract.js workers are loading correctly
- Ensure redirects are working (check Network tab)

### OCR Not Working

- Tesseract.js downloads language files at runtime
- Ensure your hosting allows external CDN requests
- Check CORS headers if using custom domain

## Performance Optimization

For production, consider:
- Enabling Netlify's image optimization
- Using Netlify Edge Functions for advanced features
- Implementing analytics (Netlify Analytics or Google Analytics)

## Support

For deployment issues:
- Check [Netlify Docs](https://docs.netlify.com/)
- Review [Next.js on Netlify Guide](https://docs.netlify.com/frameworks/next-js/)
- Open an issue in the repository
