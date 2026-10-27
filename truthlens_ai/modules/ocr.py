"""
TruthLens AI - Image OCR Module
Extracts textual claims from news screenshots, social media forwards, and headlines.
Supports JPG, JPEG, PNG formats with fallback handling.
"""

import os
from typing import Dict, Any

class ImageOCR:
    def __init__(self):
        self._tesseract_available = None

    def check_availability(self) -> bool:
        if self._tesseract_available is not None:
            return self._tesseract_available
        try:
            import pytesseract
            # Quick check if binary responds
            pytesseract.get_tesseract_version()
            self._tesseract_available = True
        except Exception:
            self._tesseract_available = False
        return self._tesseract_available

    def extract_text(self, image_path: str) -> Dict[str, Any]:
        """
        Extracts text from given image path.
        Returns dictionary with status, text detected, and word count.
        """
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": f"Image file not found: {image_path}",
                "text": ""
            }

        try:
            from PIL import Image, ImageEnhance, ImageFilter

            # Preprocessing image for improved OCR accuracy
            image = Image.open(image_path)
            # Convert to grayscale
            gray = image.convert('L')
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.8)

            if self.check_availability():
                import pytesseract
                extracted = pytesseract.image_to_string(enhanced)
                cleaned = extracted.strip()
                if not cleaned:
                    return {
                        "success": True,
                        "text": "",
                        "message": "Image processed, but no legible text was detected in the graphic."
                    }
                return {
                    "success": True,
                    "text": cleaned,
                    "word_count": len(cleaned.split()),
                    "message": "Text successfully detected and extracted via OCR engine."
                }
            else:
                return {
                    "success": False,
                    "text": "",
                    "message": "Pytesseract OCR binary not detected on host system. In TruthLens AI web client, in-browser WebAssembly Tesseract.js is utilized for instantaneous client-side OCR without local binary dependencies."
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": ""
            }

if __name__ == "__main__":
    ocr = ImageOCR()
    print("OCR Available on local Python:", ocr.check_availability())
