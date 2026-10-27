import { createWorker } from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  wordCount: number;
  error?: string;
}

/**
 * Preprocesses an image file on an HTML5 canvas to boost contrast and binarization
 * for higher OCR recognition accuracy on news headlines and social media screenshots.
 */
export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Set dimensions (scale if too small)
        const scale = img.width < 800 ? 1.5 : 1.0;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data to apply high contrast grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Standard luminance formula
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Simple contrast stretch
          const contrast = 1.3;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const adjusted = factor * (gray - 128) + 128;
          const finalVal = Math.min(255, Math.max(0, adjusted));

          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function performOCR(
  imageSource: File | string,
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResult> {
  let worker: any = null;
  try {
    if (onProgress) onProgress(10, 'Initializing OCR engine...');

    worker = await createWorker('eng');

    let processedSource = imageSource;
    if (imageSource instanceof File) {
      if (onProgress) onProgress(25, 'Enhancing image contrast...');
      try {
        processedSource = await preprocessImage(imageSource);
      } catch (err) {
        console.warn('Preprocessing skipped:', err);
      }
    }

    if (onProgress) onProgress(50, 'Extracting text from image...');

    const ret = await worker.recognize(processedSource);
    const text = ret?.data?.text?.trim() || '';
    const confidence = Math.round(ret?.data?.confidence || 0);

    if (onProgress) onProgress(100, 'Text extraction complete');

    await worker.terminate();

    const words = text.split(/\s+/).filter(Boolean);

    if (!text) {
      return {
        success: true,
        text: '',
        confidence: 0,
        wordCount: 0,
        error: 'No legible text characters detected in this image. Try uploading a clearer screenshot or headline.'
      };
    }

    return {
      success: true,
      text,
      confidence,
      wordCount: words.length
    };
  } catch (error: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
    }
    console.error('OCR Processing error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      wordCount: 0,
      error: error?.message || 'Failed to process image OCR. Please ensure the image is a valid JPG or PNG format.'
    };
  }
}
