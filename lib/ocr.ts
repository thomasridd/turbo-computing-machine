import Tesseract from 'tesseract.js';

export async function processImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
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
