import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import Tesseract from 'tesseract.js';
const mammoth = require('mammoth');

export async function extractTextFromFile({ buffer, mimetype }) {
  // Plain text files
  if (mimetype === 'text/plain' || mimetype === 'text/txt') {
    try {
      const text = buffer.toString('utf-8');
      if (text && text.trim()) {
        return text;
      }
    } catch (e) {
      console.warn('text extraction failed:', e.message);
    }
  }

  // PDF
  if (mimetype === 'application/pdf') {
    try {
      const data = await pdf(buffer);
      if (data && data.text && data.text.trim()) {
        return data.text;
      }
    } catch (e) {
      console.warn('pdf-parse failed:', e.message || e);
    }
  }

  // DOCX
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const doc = await mammoth.extractRawText({ buffer });
      if (doc && doc.value && doc.value.trim()) {
        return doc.value;
      }
    } catch (e) {
      console.warn('mammoth failed:', e.message || e);
    }
  }

  // Image files - only try OCR for actual image types
  if (mimetype && mimetype.startsWith('image/')) {
    try {
      console.log('Running Tesseract OCR for image:', mimetype);
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng', { logger: () => {} });
      if (text && text.trim()) {
        return text;
      }
    } catch (e) {
      console.error('Tesseract OCR failed:', e.message);
    }
  }
  
  return ''; // Return empty string if all extraction methods fail
}
