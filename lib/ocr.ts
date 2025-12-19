import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence?: number;
  provider?: string;
}

/**
 * Process image using cloud OCR API (Google Cloud Vision or OCR.space)
 * Falls back to Tesseract.js if API is not available or fails
 */
export async function processImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Try cloud OCR first (via Netlify Function)
    const text = await processWithCloudOCR(imageFile, onProgress);
    if (text) {
      return text;
    }
  } catch (error) {
    console.warn('Cloud OCR failed, falling back to Tesseract.js:', error);
  }

  // Fallback to Tesseract.js
  return processWithTesseract(imageFile, onProgress);
}

/**
 * Process image using cloud OCR API via Netlify Function
 */
async function processWithCloudOCR(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  onProgress?.(0.1);

  // Convert file to base64
  const base64 = await fileToBase64(imageFile);

  onProgress?.(0.3);

  // Call Netlify Function
  const response = await fetch('/.netlify/functions/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64 }),
  });

  onProgress?.(0.8);

  if (!response.ok) {
    // If 503, it means no API key is configured - fall back to Tesseract
    if (response.status === 503) {
      console.info('No cloud OCR API configured, using Tesseract.js');
      return null;
    }
    throw new Error(`OCR API failed: ${response.statusText}`);
  }

  const result: OCRResult = await response.json();
  onProgress?.(1.0);

  console.info(`OCR completed using ${result.provider || 'cloud service'}`);
  return result.text;
}

/**
 * Process image using Tesseract.js (fallback)
 */
async function processWithTesseract(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.info('Using Tesseract.js for OCR');

  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    },
  });

  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();

  return text;
}

/**
 * Convert File to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
