import * as fabric from 'fabric';

export type BBox = { x0: number; y0: number; x1: number; y1: number };
export type Phrase = { text: string; bbox: BBox };


export function initializeCanvas(el: HTMLCanvasElement): fabric.Canvas {
  return new fabric.Canvas(el);
}

export function setBackgroundImage(canvas: fabric.Canvas, imageEl: HTMLImageElement) {
  const width = imageEl.naturalWidth;
  const height = imageEl.naturalHeight;

  canvas.setWidth(width);
  canvas.setHeight(height);

  const img = new fabric.Image(imageEl);
  canvas.backgroundImage = img;
  canvas.renderAll();
}

export function initializeDrawingMode(canvas: fabric.Canvas) {
  let rect: fabric.Rect | null = null;
  let origin: fabric.Point | null = null;
  let isDrawing = false;

  canvas.on('mouse:down', (o) => {
    if (o.target) {
      return;
    }

    isDrawing = true;
    const pointer = canvas.getPointer(o.e);
    origin = new fabric.Point(pointer.x, pointer.y);

    rect = new fabric.Rect({
      left: origin.x,
      top: origin.y,
      originX: 'left',
      originY: 'top',
      width: pointer.x - origin.x,
      height: pointer.y - origin.y,
      angle: 0,
      fill: 'rgba(255, 0, 255, 0.3)',
      stroke: '#ff00ff',
      strokeWidth: 2,
      cornerColor: 'white',
      cornerStrokeColor: '#ff00ff',
      transparentCorners: false,
      cornerSize: 12,
      hasRotatingPoint: true,
      uniScaleTransform: false,
      lockScalingFlip: true,
    });

    canvas.addWithDeleteControl(rect);
  });

  // On mouse move, update the rectangle's size
  canvas.on('mouse:move', (o) => {
    if (!isDrawing || !origin || !rect) {
      return;
    }

    const pointer = canvas.getPointer(o.e);

    // Handle dragging in all directions (up, down, left, right)
    if (origin.x > pointer.x) {
      rect.set({ left: Math.abs(pointer.x) });
    }
    if (origin.y > pointer.y) {
      rect.set({ top: Math.abs(pointer.y) });
    }

    rect.set({ width: Math.abs(origin.x - pointer.x) });
    rect.set({ height: Math.abs(origin.y - pointer.y) });

    canvas.requestRenderAll();
  });

  canvas.on('mouse:up', () => {
    if (isDrawing && rect) {
      if (rect.width < 5 && rect.height < 5) {
        canvas.remove(rect);
      } else {
        rect.set({ data: { text: 'custom' } });
      }
    }
    isDrawing = false;
    rect = null;
    origin = null;
  });
}

export function addHighlightRect(canvas: fabric.Canvas, phrase: Phrase) {
  const rect = new fabric.Rect({
    left: phrase.bbox.x0,
    top: phrase.bbox.y0,
    width: phrase.bbox.x1 - phrase.bbox.x0,
    height: phrase.bbox.y1 - phrase.bbox.y0,
    fill: 'rgba(255, 0, 255, 0.3)',
    stroke: '#ff00ff',
    strokeWidth: 2,
    cornerColor: 'white',
    cornerStrokeColor: '#ff00ff',
    transparentCorners: false,
    cornerSize: 12,
    uniScaleTransform: false,
    lockScalingFlip: true,
    data: { text: phrase.text },
  });

  // @ts-ignore
  canvas.addWithDeleteControl(rect);
}

export function getPhraseRects(canvas: fabric.Canvas): fabric.Rect[] {
  return canvas.getObjects('rect') as fabric.Rect[];
}

async function toBlob(canvasEl: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvasEl.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed.'));
      }
    }, 'image/png');
  });
}


export async function cropAllRects(
  mainCanvas: fabric.Canvas,
  imageEl: HTMLImageElement
): Promise<{ text: string; imageBlob: Blob }[]> {
  const rects = getPhraseRects(mainCanvas);
  const croppedData: { text: string; imageBlob: Blob }[] = [];

  for (const rect of rects) {
    const width = rect.getScaledWidth();
    const height = rect.getScaledHeight();
    const angle = rect.angle || 0;
    if (width <= 0 || height <= 0) continue;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) continue;

    const center = rect.getCenterPoint();

    tempCtx.translate(width / 2, height / 2);

    tempCtx.rotate(-fabric.util.degreesToRadians(angle));

    tempCtx.drawImage(
      imageEl,
      -center.x,
      -center.y
    );

    const blob = await toBlob(tempCanvas);
    croppedData.push({
      text: rect.data?.text || 'custom',
      imageBlob: blob,
    });
  }

  return croppedData;
}
