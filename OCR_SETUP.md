# OCR Setup Guide

The Receipt Splitter app supports multiple OCR providers with automatic fallback to Tesseract.js.

## OCR Providers

### Option 1: Google Cloud Vision API (Recommended)

Google Cloud Vision provides the best accuracy for receipt text extraction.

#### Setup Steps:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Cloud Vision API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

4. **Restrict API Key (Recommended)**
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Under "Application restrictions", add your Netlify domain

5. **Add to Netlify**
   - Go to your Netlify site dashboard
   - Navigate to "Site settings" > "Environment variables"
   - Add variable:
     - Key: `GOOGLE_CLOUD_VISION_API_KEY`
     - Value: `your-api-key-here`

6. **Redeploy**
   - Trigger a new deployment for the environment variable to take effect

#### Pricing:
- Free tier: 1,000 requests/month
- After free tier: $1.50 per 1,000 requests
- [Pricing details](https://cloud.google.com/vision/pricing)

---

### Option 2: OCR.space API (Free Alternative)

OCR.space offers a free tier with good accuracy.

#### Setup Steps:

1. **Get API Key**
   - Go to [OCR.space](https://ocr.space/ocrapi)
   - Sign up for a free account
   - Copy your API key from the dashboard

2. **Add to Netlify**
   - Go to your Netlify site dashboard
   - Navigate to "Site settings" > "Environment variables"
   - Add variable:
     - Key: `OCR_SPACE_API_KEY`
     - Value: `your-api-key-here`

3. **Redeploy**
   - Trigger a new deployment

#### Pricing:
- Free tier: 25,000 requests/month
- PRO tier: $60/month for 1 million requests
- [Pricing details](https://ocr.space/ocrapi/faq)

---

### Option 3: Tesseract.js (No Setup Required)

If no API key is configured, the app automatically uses Tesseract.js.

**Pros:**
- No API key needed
- Completely client-side
- Free and unlimited
- Works offline

**Cons:**
- Lower accuracy than cloud services
- Slower processing
- Larger download size
- May struggle with poor quality images

---

## Choosing the Right Provider

| Provider | Accuracy | Speed | Cost | Best For |
|----------|----------|-------|------|----------|
| Google Cloud Vision | Excellent | Fast | Paid (free tier) | Production apps with high accuracy needs |
| OCR.space | Good | Medium | Free (limits apply) | Projects with moderate usage |
| Tesseract.js | Fair | Slow | Free | Development, offline use, no budget |

---

## Testing Your OCR Setup

### Check Which Provider is Active

Open your browser's Developer Console while using the app:

1. Upload a receipt
2. Start OCR processing
3. Look for console messages:
   - `OCR completed using google-cloud-vision` - Google API is working
   - `OCR completed using ocr-space` - OCR.space API is working
   - `Using Tesseract.js for OCR` - Fallback to Tesseract.js
   - `No cloud OCR API configured, using Tesseract.js` - No API key set

### Testing Accuracy

Use a clear, well-lit receipt photo with:
- Clear text
- Good contrast
- No shadows or glare
- Straight orientation (not skewed)

Expected results:
- **Google Cloud Vision**: ~95-99% accuracy on clear receipts
- **OCR.space**: ~85-95% accuracy on clear receipts
- **Tesseract.js**: ~70-85% accuracy on clear receipts

---

## Troubleshooting

### OCR Returns Empty Text

**Possible causes:**
- API key is invalid or expired
- API quota exceeded
- Network connectivity issues
- Image quality is too poor

**Solutions:**
1. Check API key in Netlify environment variables
2. Verify API quotas in provider dashboard
3. Try a clearer image
4. Check browser console for error messages

### API Returns 503 Error

This means no API key is configured. The app will automatically fall back to Tesseract.js.

To fix:
1. Add API key as environment variable in Netlify
2. Redeploy the site
3. Clear browser cache

### "API Key Not Valid" Error

**For Google Cloud Vision:**
1. Verify the API is enabled in your Google Cloud project
2. Check that the API key hasn't been restricted too much
3. Ensure billing is enabled (required after free tier)

**For OCR.space:**
1. Verify the API key is correct
2. Check that you haven't exceeded the free tier limit
3. Ensure the API key is active

### Slow Performance

**If using Tesseract.js:**
- Normal behavior - client-side processing is slower
- Consider upgrading to a cloud OCR service

**If using cloud API:**
- Check network connection
- Reduce image file size (resize before upload)
- Check API service status page

---

## Development vs Production

### Local Development

For local development without API keys:
```bash
npm run dev
```
The app will automatically use Tesseract.js - no configuration needed.

### Production with API Keys

1. Add API keys to Netlify environment variables
2. Deploy to Netlify
3. Test with a real receipt

### Environment Variables Best Practices

- **Never commit API keys to Git**
- Use different API keys for development and production
- Set up API key restrictions by domain
- Monitor API usage in provider dashboards
- Set up billing alerts to avoid unexpected charges

---

## Advanced Configuration

### Using Both Providers

You can set both API keys. The app will prefer Google Cloud Vision:

```
GOOGLE_CLOUD_VISION_API_KEY=your-google-key
OCR_SPACE_API_KEY=your-ocr-space-key
```

Priority order:
1. Google Cloud Vision (if key is set)
2. OCR.space (if Google key is not set)
3. Tesseract.js (fallback if no keys or if APIs fail)

### Custom Netlify Function

The OCR processing is handled by `netlify/functions/ocr.ts`. You can modify this to:
- Add more OCR providers
- Implement custom preprocessing
- Add caching
- Implement rate limiting

---

## Security Considerations

1. **API Keys**
   - Never expose API keys in client-side code
   - Use Netlify Functions to keep keys server-side
   - Restrict keys by domain/IP when possible

2. **Rate Limiting**
   - Monitor API usage to prevent abuse
   - Consider implementing your own rate limiting

3. **Data Privacy**
   - Receipt images are sent to third-party OCR services
   - Inform users if required by privacy regulations
   - Images are not stored by this app

---

## Support

### Google Cloud Vision
- [Documentation](https://cloud.google.com/vision/docs)
- [Support](https://cloud.google.com/support)

### OCR.space
- [Documentation](https://ocr.space/ocrapi)
- [Support](https://ocr.space/ocrapi/support)

### Tesseract.js
- [GitHub](https://github.com/naptha/tesseract.js)
- [Documentation](https://tesseract.projectnaptha.com/)
