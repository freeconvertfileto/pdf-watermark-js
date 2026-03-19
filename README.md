# PDF Watermark Tool

Add a text watermark to every page of a PDF using pdf.js canvas rendering with configurable position, font size, color, and opacity, with output as per-page JPEG downloads.

**Live Demo:** https://file-converter-free.com/en/pdf-tools/pdf-watermark-online

## How It Works

The PDF file is read via `FileReader.readAsArrayBuffer` into a `Uint8Array`. pdf.js renders each page onto a canvas at 2x scale using `page.getViewport({scale: 2.0})` and `page.render({canvasContext: ctx, viewport})`. After rendering, `drawWatermark()` is called with the canvas context: it sets `ctx.globalAlpha` to the configured opacity and `ctx.font` to the selected font size (scaled by 2 for the 2x canvas). For the `center` position, the context is translated to the canvas midpoint and rotated by `-Math.PI / 6` (30 degrees counterclockwise) before drawing. For corner positions (top-left, top-right, bottom-left, bottom-right), the text is positioned using `ctx.measureText(text).width` and padding offsets from the edges. The watermarked canvas is exported as `canvas.toDataURL('image/jpeg', 0.92)` and offered as a per-page JPEG download.

## Features

- Text watermark with configurable font size, color, and opacity
- Five position options: center (diagonal), top-left, top-right, bottom-left, bottom-right
- Center position applies -30 degree rotation
- 2x scale rendering for crisp output
- Per-page JPEG preview thumbnails with individual download links

## Browser APIs Used

- pdf.js (`pdfjsLib.getDocument`, `getPage`, `getViewport`, `render`)
- Canvas API (2D context, `globalAlpha`, `measureText`, `translate`, `rotate`, `fillText`, `toDataURL`)
- FileReader API (`readAsArrayBuffer`)

## Code Structure

| File | Description |
|------|-------------|
| `pdf-watermark.js` | IIFE — `pdfjsLib.getDocument` render at 2x scale, `drawWatermark` with 5 positions and rotation, `toDataURL('image/jpeg')` per-page output |

## Usage

| Element ID | Purpose |
|------------|---------|
| `pwmUploadArea` | Drag-and-drop target for PDF file |
| `pwmUploadBtn` | Open file picker |
| `pwmFileInput` | File picker input |
| `pwmEditor` | Editor panel (shown after file load) |
| `pwmFileName` | File name and size display |
| `pwmText` | Watermark text input |
| `pwmFontSize` | Font size selector |
| `pwmColor` | Color picker |
| `pwmOpacity` | Opacity slider |
| `pwmOpacityValue` | Opacity value display |
| `pwmPosition` | Position selector (center / corner options) |
| `pwmAddBtn` | Apply watermark and generate output |
| `pwmStatus` | Status message display |
| `pwmOutput` | Output panel (shown after processing) |
| `pwmPages` | Container for watermarked page cards with download links |

## License

MIT
