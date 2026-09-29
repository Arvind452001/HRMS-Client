import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

/**
 * Renders a DOM node to a high-res canvas and drops it into an A4 PDF,
 * ensuring clean single-page output for salary slips.
 *
 * @param {HTMLElement} node - the element to capture
 * @param {string} fileName - e.g. "Salary-Slip-John_Doe-Jan-2026.pdf"
 */
export async function generatePdfFromNode(node, fileName) {
  if (!node) throw new Error("Nothing to export — the document isn't ready yet.");

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Use a 1.5mm threshold to avoid creating an empty second page from sub-pixel rounding
  while (heightLeft > 1.5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

