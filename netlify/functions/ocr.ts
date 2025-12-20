import { Handler, HandlerEvent } from '@netlify/functions';

interface OCRResponse {
  text: string;
  confidence?: number;
}

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image } = JSON.parse(event.body || '{}');

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image provided' }),
      };
    }

    // Check which OCR service to use based on environment variables
    const googleApiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    const ocrSpaceApiKey = process.env.OCR_SPACE_API_KEY;

    if (googleApiKey) {
      // Use Google Cloud Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: image.split(',')[1], // Remove data:image/xxx;base64, prefix
                },
                features: [
                  {
                    type: 'DOCUMENT_TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // Check for errors from Google API
      if (!response.ok) {
        console.error('Google Vision API error:', data);
        return {
          statusCode: response.status,
          body: JSON.stringify({
            error: 'Google Cloud Vision API failed',
            details: data.error?.message || 'Unknown error',
          }),
        };
      }

      // Check if response contains errors
      if (data.responses && data.responses[0].error) {
        console.error('Google Vision API error:', data.responses[0].error);
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Google Cloud Vision API failed',
            details: data.responses[0].error.message || 'Unknown error',
          }),
        };
      }

      if (data.responses && data.responses[0].fullTextAnnotation) {
        const text = data.responses[0].fullTextAnnotation.text;
        return {
          statusCode: 200,
          body: JSON.stringify({
            text,
            confidence: 0.9,
            provider: 'google-cloud-vision',
          }),
        };
      }

      // If no text was detected
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No text detected in image',
          details: 'Google Cloud Vision did not find any text in the image',
        }),
      };
    } else if (ocrSpaceApiKey) {
      // Use OCR.space API
      const formData = new FormData();
      formData.append('base64Image', image);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('isTable', 'false'); // Disable table detection to avoid column splitting
      formData.append('OCREngine', '1'); // Use OCR Engine 1 (legacy) for simpler text extraction

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': ocrSpaceApiKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.ParsedResults && data.ParsedResults[0]) {
        const text = data.ParsedResults[0].ParsedText;
        return {
          statusCode: 200,
          body: JSON.stringify({
            text,
            confidence: 0.85,
            provider: 'ocr-space',
          }),
        };
      }
    }

    // If no API keys are configured, return error
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'No OCR service configured. Please set GOOGLE_CLOUD_VISION_API_KEY or OCR_SPACE_API_KEY environment variable.',
      }),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
