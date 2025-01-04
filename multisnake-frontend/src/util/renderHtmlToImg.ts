// Jonas Karg 2023

/**
 * Renders HTML to an image.
 * @param html String containing the HTML markup
 * @param width Width of viewport
 * @param height Height of viewport
 * @returns A promise which resolves to an HTMLImageElement
 */
export default function renderHtmlToImg(html: string, width: number, height: number): Promise<HTMLImageElement> {
  const img = document.createElement('img');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
      </foreignObject>
    </svg>`;

  // Base64 encoded image
  img.src = `data:image/svg+xml;base64,${btoa(svg)}`;

  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(img));
  });
}
