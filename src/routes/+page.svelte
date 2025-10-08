<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import * as fabric from 'fabric';

  import * as db from '$lib/db';
  import * as ocr from '$lib/ocr';
  import * as canvas from '$lib/canvas';
  import {groupWordsIntoPhrases} from '$lib/phraseGrouper';
  import type {StoredMaterial} from '$lib/db';

  type DisplayMaterial = StoredMaterial & {url: string};

  let imageSrc: string | null = null;
  let croppedMaterials: DisplayMaterial[] = [];
  let status = 'Initializing...';
  let isLoading = true;
  let isAnalyzing = false;
  let isCropping = false;

  let imageEl: HTMLImageElement;
  let canvasEl: HTMLCanvasElement;

  let fabricCanvas: fabric.Canvas;

  onMount(async () => {
    status = 'Loading OCR engine...';
    try {
      await ocr.initializeWorker((_, statusText) => {
        status = statusText;
      });
      await loadMaterialsFromDB();

      setupFabricDeleteControl();

      status = 'Ready. Upload an image to start.';
    } catch (error) {
      status = 'Failed to initialize. Please refresh.';
      console.error('Initialization error:', error);
    } finally {
      isLoading = false;
    }
  });

  onDestroy(() => {
    croppedMaterials.forEach((item) => URL.revokeObjectURL(item.url));
  });

  async function loadMaterialsFromDB() {
    const materialsFromDb = await db.getAllMaterials();
    croppedMaterials.forEach((item) => URL.revokeObjectURL(item.url));
    croppedMaterials = materialsFromDb.map((item) => ({
      ...item,
      url: URL.createObjectURL(item.imageBlob),
    }));
    console.log(`Loaded ${croppedMaterials.length} materials from DB.`);
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      imageSrc = URL.createObjectURL(file);
      fabricCanvas?.clear();
    }
  }

  function onImageLoad() {
    if (!imageEl || !canvasEl) return;
    if (!fabricCanvas) {
      fabricCanvas = canvas.initializeCanvas(canvasEl);
      canvas.initializeDrawingMode(fabricCanvas);
    }
    canvas.setBackgroundImage(fabricCanvas, imageEl);
  }

  async function analyzeImage() {
    if (!imageEl || !fabricCanvas) return;
    isAnalyzing = true;
    status = 'Analyzing image...';

    canvas.getPhraseRects(fabricCanvas).forEach((obj) => fabricCanvas.remove(obj));

    try {
      const words = await ocr.analyzeImage(imageEl);
      const filteredWords = words.filter((w) => w.confidence > 60);
      console.log(`OCR found ${words.length} words, ${filteredWords.length} after filtering.`);
      const phrases = groupWordsIntoPhrases(filteredWords);
      phrases.forEach((phrase) => canvas.addHighlightRect(fabricCanvas, phrase));
      status = `Analysis complete. Found ${phrases.length} editable phrases.`;
    } catch (error) {
      status = 'Error during analysis.';
      console.error(error);
    } finally {
      isAnalyzing = false;
    }
  }

  async function cropAllPhrases() {
    if (!imageEl || !fabricCanvas) return;
    isCropping = true;
    status = 'Cropping and saving to library...';

    try {
      const croppedData = await canvas.cropAllRects(fabricCanvas, imageEl);
      if (croppedData.length === 0) {
        status = 'No regions selected to crop.';
        isCropping = false;
        return;
      }
      await Promise.all(croppedData.map((item) => db.addMaterial(item)));
      await loadMaterialsFromDB();
      status = `Cropping complete. ${croppedData.length} new materials saved.`;
    } catch (error) {
      status = 'Error during cropping process.';
      console.error(error);
    } finally {
      isCropping = false;
    }
  }

  async function handleClearAll() {
    if (confirm('Are you sure you want to delete all materials? This cannot be undone.')) {
      await db.clearAllMaterials();
      await loadMaterialsFromDB();
    }
  }

  function setupFabricDeleteControl() {
    const deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='0 0 595.275 595.275' enable-background='new 0 0 595.275 595.275' xml:space='preserve'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' d='M355.067,297.636l237.122-237.121c4.293-4.292,4.293-11.259,0-15.551s-11.259-4.292-15.551,0L339.516,282.084L102.394,44.963c-4.292-4.292-11.259-4.292-15.551,0s-4.292,11.259,0,15.551l237.122,237.121L86.842,534.757c-4.292,4.293-4.292,11.259,0,15.551s11.259,4.293,15.551,0l237.121-237.122l237.121,237.122c4.293,4.293,11.259,4.293,15.551,0s4.293-11.259,0-15.551L355.067,297.636z'/%3E%3C/g%3E%3C/svg%3E";
    const delImg = document.createElement('img');
    delImg.src = deleteIcon;

    const createDeleteControl = () =>
      new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -16,
        offsetX: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: (eventData, transform) => {
          const target = transform.target;
          const canvas = target.canvas;
          if (canvas) {
            canvas.remove(target);
            canvas.requestRenderAll();
          }
          return true;
        },
        render: (ctx, left, top, styleOverride, fabricObject) => {
          const size = 24;
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
          ctx.drawImage(delImg, -size / 2, -size / 2, size, size);
          ctx.restore();
        },
      });

    fabric.Canvas.prototype.addWithDeleteControl = function (obj) {
      obj.controls = {
        ...fabric.controlsUtils.createObjectDefaultControls(obj),
        deleteControl: createDeleteControl(),
      };
      this.add(obj);
      return obj;
    };
  }
</script>

<div class="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8 overflow-auto">
  <main class="max-w-7xl mx-auto space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Collage Poem Maker</h1>
      <p class="mt-3 text-base text-gray-500">
        <span class="font-semibold">Status:</span>
        {status}
      </p>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <div class="flex flex-wrap items-center gap-4">
        <input
          type="file"
          accept="image/*"
          on:change={handleFileChange}
          disabled={isLoading || isAnalyzing || isCropping}
          class="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          on:click={analyzeImage}
          disabled={isLoading || isAnalyzing || isCropping || !imageSrc}
          class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isAnalyzing}Analyzing...{:else}Analyze Image{/if}
        </button>
        <button
          on:click={cropAllPhrases}
          disabled={isLoading ||
            isAnalyzing ||
            isCropping ||
            !fabricCanvas ||
            canvas.getPhraseRects(fabricCanvas).length === 0}
          class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isCropping}Saving...{:else}Crop & Add to Library{/if}
        </button>
      </div>

      {#if imageSrc}
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50/50">
          <div class="relative w-full">
            <img
              bind:this={imageEl}
              src={imageSrc}
              alt="uploaded content"
              on:load={onImageLoad}
              class="absolute opacity-0 pointer-events-none -z-10"
            />
            <canvas
              bind:this={canvasEl}
              class="block mx-auto max-w-full h-auto"
            ></canvas>
          </div>
        </div>
      {/if}
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800">
          Material Library ({croppedMaterials.length} items)
        </h3>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={handleClearAll}
          disabled={croppedMaterials.length === 0}
        >
          Clear All
        </button>
      </div>

      {#if croppedMaterials.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {#each croppedMaterials as item (item.id)}
            <div
              class="group flex flex-col border border-gray-200 rounded-lg p-2 text-center bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform duration-200"
            >
              <div class="bg-gray-100 rounded-md p-1 mb-2">
                <img
                  src={item.url}
                  alt={item.text}
                  class="w-full h-auto object-contain"
                />
              </div>
              <p class="text-xs text-gray-600 break-all flex-grow">{item.text}</p>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 px-4 bg-gray-100/60 rounded-lg">
          <p class="text-sm text-gray-500">
            Your material library is empty. Analyze and crop an image to add materials.
          </p>
        </div>
      {/if}
    </div>
  </main>
</div>
