/** A4 in millimetres, and the pixel size each report page is designed at (96 dpi). */
const PAGE_MM = { width: 210, height: 297 };
export const PDF_PAGE_PX = { width: 794, height: 1123 };

const FONT_WEIGHTS = [400, 700, 800];

const FONT_FILES: Array<[number, string]> = [
  [300, "Light"],
  [400, "Regular"],
  [500, "Medium"],
  [600, "SemiBold"],
  [700, "Bold"],
  [800, "ExtraBold"],
];

let fontCssPromise: Promise<string> | null = null;

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * The brand font as ready-made @font-face rules. Handing this to the renderer stops it from
 * crawling every stylesheet on the page, which is slow and can stall.
 */
function loadFontCss() {
  fontCssPromise ??= Promise.all(
    FONT_FILES.map(async ([weight, file]) => {
      const response = await fetch(`/font/SomarRounded-${file}.ttf`);
      const data = await blobToDataUrl(await response.blob());
      return `@font-face{font-family:'SomarRounded';font-weight:${weight};font-style:normal;src:url(${data}) format('truetype');}`;
    })
  )
    .then((rules) => rules.join(""))
    .catch((error) => {
      fontCssPromise = null;
      throw error;
    });

  return fontCssPromise;
}

async function waitForFonts() {
  if (!document.fonts) {
    return;
  }

  await Promise.all(FONT_WEIGHTS.map((weight) => document.fonts.load(`${weight} 20px SomarRounded`).catch(() => [])));
  await document.fonts.ready;
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images
      .filter((image) => !image.complete)
      .map(
        (image) =>
          new Promise((resolve) => {
            image.onload = image.onerror = () => resolve(undefined);
          })
      )
  );
}

/**
 * Renders every `[data-pdf-page]` inside `root` with the browser's own engine (so Arabic letters
 * join correctly and the brand font is used) and assembles them into a multi-page A4 PDF.
 */
export async function renderPagesToPdf(root: HTMLElement) {
  const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  await waitForFonts();
  await waitForImages(root);

  const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-page]"));
  if (pages.length === 0) {
    throw new Error("No report pages to render.");
  }

  const options = {
    fontEmbedCSS: await loadFontCss(),
    width: PDF_PAGE_PX.width,
    height: PDF_PAGE_PX.height,
    backgroundColor: "#ffffff",
    quality: 0.92,
  };

  // The first capture often misses fonts and images the library hasn't fetched yet, so it is a throwaway.
  await toJpeg(pages[0], { ...options, pixelRatio: 0.25 });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

  for (const [index, page] of pages.entries()) {
    const image = await toJpeg(page, { ...options, pixelRatio: 2 });

    if (index > 0) {
      pdf.addPage();
    }
    pdf.addImage(image, "JPEG", 0, 0, PAGE_MM.width, PAGE_MM.height, undefined, "FAST");
  }

  return pdf;
}

export function toSafeFileName(name: string) {
  const cleaned = name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return cleaned || "Student";
}
