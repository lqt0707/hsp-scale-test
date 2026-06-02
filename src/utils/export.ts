import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportAsImage(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;

  // Calculate scale to fit width
  const scale = contentWidth / imgWidth;
  const scaledHeight = imgHeight * scale;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate how many pages we need
  const pageContentHeight = pdfHeight - margin * 2;
  let remainingHeight = scaledHeight;
  let yOffset = 0;
  let pageIndex = 0;

  while (remainingHeight > 0) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const sliceHeight = Math.min(pageContentHeight, remainingHeight);

    // Create a temporary canvas for this page slice
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = (sliceHeight / scale) * 2; // account for scale:2

    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        0, yOffset / scale * 2,
        imgWidth, sliceCanvas.height,
        0, 0,
        sliceCanvas.width, sliceCanvas.height
      );
    }

    const sliceData = sliceCanvas.toDataURL('image/png');
    pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeight);

    yOffset += sliceHeight;
    remainingHeight -= sliceHeight;
    pageIndex++;
  }

  pdf.save(`${filename}.pdf`);
}
