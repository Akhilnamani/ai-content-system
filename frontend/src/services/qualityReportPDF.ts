import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Content {
  _id: string;
  title: string;
  topic: string;
  contentType: string;
  tone: string;
  content: string;
  createdAt: string;
  aiModel?: string;
  qualityScore?: number;
  halluccinationRisk?: 'high' | 'medium' | 'low' | 'none';
  flaggedClaims?: any[];
  factCheckStatus?: 'verified' | 'flagged' | 'needs-review';
  qualityDetails?: {
    wordCount: number;
    sentenceCount: number;
    readabilityScore: number;
    structureScore: number;
    uniqueWordsRatio: number;
  };
}

export const exportQualityReportPDF = async (content: Content) => {
  try {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.width = '900px';
    element.style.fontFamily = 'Arial, sans-serif';

    const reportHTML = `
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="margin: 0; color: #1e40af; font-size: 32px;">📊 Quality Analysis Report</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Content Overview</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold; width: 30%;">Title:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${content.title}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Topic:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${content.topic}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Type:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${content.contentType}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">Tone:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${content.tone}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; background: #f3f4f6; font-weight: bold;">AI Model:</td>
            <td style="padding: 12px; border: 1px solid #ddd;">🤖 ${content.aiModel || 'Unknown'}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Quality Scores</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          <div style="padding: 20px; background: #f0fdf4; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Overall Score</p>
            <p style="margin: 10px 0; font-size: 36px; font-weight: bold; color: #16a34a;">${content.qualityScore || 0}/100</p>
          </div>
          <div style="padding: 20px; background: #f0fdf4; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Risk Level</p>
            <p style="margin: 10px 0; font-size: 28px; font-weight: bold;">✅ ${content.halluccinationRisk || 'NONE'}</p>
          </div>
        </div>
      </div>

      ${content.qualityDetails ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Metrics</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
          <div style="padding: 15px; background: #eff6ff; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px;">Words</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #3b82f6;">${content.qualityDetails.wordCount}</p>
          </div>
          <div style="padding: 15px; background: #f0fdf4; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px;">Readability</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #22c55e;">${content.qualityDetails.readabilityScore.toFixed(1)}</p>
          </div>
          <div style="padding: 15px; background: #faf5ff; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px;">Structure</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #a855f7;">${content.qualityDetails.structureScore}/100</p>
          </div>
        </div>
      </div>
      ` : ''}
    `;

    element.innerHTML = reportHTML;
    document.body.appendChild(element);

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210 - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= 297 - 20;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(`${content.title}-Quality-Report.pdf`);
    alert('Quality report exported successfully!');
    console.log('✅ Quality report exported');

    document.body.removeChild(element);
  } catch (error) {
    console.error('❌ Error exporting quality report:', error);
    alert('Failed to export quality report');
  }
};
