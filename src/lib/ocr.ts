import { createWorker, type Worker, type Word } from 'tesseract.js';

let worker: Worker | null = null;

export async function initializeWorker(onProgress: (progress: number, status: string) => void): Promise<void> {
  if (worker) return;

  worker = await createWorker('chi_sim', 1, {
    logger: (m) => {
      console.log(m);
      if (m.status === 'loading language model') {
        onProgress(m.progress, `Loading language model: ${ (m.progress * 100).toFixed(0) }%`);
      } else {
        onProgress(0, m.status);
      }
    },
  });
}


export async function analyzeImage(imageElement: HTMLImageElement): Promise<Word[]> {
  if (!worker) {
    throw new Error('Tesseract worker not initialized.');
  }

  // @ts-ignore
  const { data: { words = [] } } = await worker.recognize(imageElement);
  return words;
}