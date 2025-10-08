import type { Bbox } from 'tesseract.js';

export interface OcrPhrase {
  text: string;
  bbox: Bbox;
}

export interface Material {
  id?: number;
  text: string;
  imageBlob: Blob;
  createdAt: Date;
}

export interface DisplayMaterial extends Material {
  url: string;
}
