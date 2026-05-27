const fs = require('fs');
const path = require('path');

const fontStack = 'Arial';
const fontSizeGeneral = 11;
const fontSizeIncisos = 11;
const lineSpacing = 1.0;

const contentText = `**LA INFRASCRITA SECRETARIA MUNICIPAL DE LA VILLA DE JOYABAJ, DEL DEPARTAMENTO DE QUICHÉ, CERTIFICA:** Tener a la Vista el libro de Actas...

**<u>DÉCIMO NOVENO</u>**: Los Integrantes del Honorable Concejo...

**ACUERDA**:

**I**. Aprobar el pago de la factura serie **A** Número de DTE **12345**...

**II**. Se ordena a la Dirección...`;

const cleanContentText = contentText.trim();

let htmlContent = cleanContentText
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\n/g, '<br/>');

function parseContentToHtml(htmlContent) {
  const lines = htmlContent
    .split(/<br\s*\/?>/i)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  let resultHtml = '';
  let inList = false;
  let hasReachedAcuerda = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const plainText = line.replace(/<[^>]*>/g, '').trim();

    if (plainText === 'ACUERDA' || plainText === 'ACUERDA:') {
      if (inList) {
        resultHtml += '</ol>';
        inList = false;
      }
      hasReachedAcuerda = true;
      resultHtml += `<p class="MsoNormal" lang="es-GT" style="text-align:center;line-height:${lineSpacing * 100}%;margin-top:0pt;margin-bottom:0pt;font-size:${fontSizeGeneral}pt;font-family:${fontStack};"><strong>ACUERDA:</strong></p>`;
      continue;
    }

    const isCierre = line.includes('…No habiendo más…') || line.includes('CERTIFICO:');
    const isCert = line.includes('LA INFRASCRITA SECRETARIA') || line.includes('Y, PARA REMITIR');

    const match = line.match(/^\s*(?:<strong>|<b>|<u>|<span[^>]*>)*([IVXLCDM]+|\d+)(?:\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)*\s*\.\s*|\s*\.\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)*\s*)\s*(.*)/);

    if (match && hasReachedAcuerda && !isCierre && !isCert) {
      const content = match[2].trim();
      if (!inList) {
        resultHtml += `<ol lang="es-GT" style="list-style-type:upper-roman;margin-top:0pt;margin-bottom:0pt;padding-left:0.5in;font-family:${fontStack};font-size:${fontSizeIncisos}pt;line-height:${lineSpacing * 100}%;">`;
        inList = true;
      }
      resultHtml += `<li lang="es-GT" style="text-align:justify;font-family:${fontStack};font-size:${fontSizeIncisos}pt;margin-bottom:0pt;line-height:${lineSpacing * 100};">${content}</li>`;
    } else {
      if (inList) {
        resultHtml += '</ol>';
        inList = false;
      }
      if (hasReachedAcuerda && (isCierre || isCert || !match)) {
        hasReachedAcuerda = false;
      }
      const size = isCert ? fontSizeGeneral : fontSizeGeneral;
      resultHtml += `<p class="MsoNormal" lang="es-GT" style="text-align:justify;line-height:${lineSpacing * 100}%;margin-top:0pt;margin-bottom:0pt;font-size:${size}pt;font-family:${fontStack};">${line}</p>`;
    }
  }

  if (inList) {
    resultHtml += '</ol>';
  }
  return resultHtml;
}

const paragraphs = parseContentToHtml(htmlContent);

const documentTemplate = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:w="urn:schemas-microsoft-com:office:word" 
        xmlns="http://www.w3.org/TR/REC-html40"
        lang="es">
  <head>
    <meta charset="utf-8">
    <title>Acuerdo Municipal</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: 8.5in 11.0in;
        margin: 1.0in 1.0in 1.0in 1.0in;
      }
      body {
        font-family: ${fontStack};
        font-size: ${fontSizeGeneral}pt;
        color: #000000;
        line-height: ${lineSpacing};
      }
      p.MsoNormal {
        margin: 0in;
        margin-bottom: 0pt;
        text-align: justify;
        font-family: ${fontStack};
        font-size: ${fontSizeGeneral}pt;
      }
      strong {
        font-weight: bold;
      }
      ol, li {
        font-family: ${fontStack};
        font-size: ${fontSizeIncisos}pt;
      }
    </style>
  </head>
  <body>${paragraphs}</body>
  </html>
`;

const cleanTemplate = documentTemplate
  .replace(/\r?\n/g, '')
  .replace(/>\s+</g, '><')
  .trim();

console.log('CLEAN DOC TEMPLATE:', cleanTemplate.substring(0, 500));
console.log('CLEAN DOC BODY PART:', cleanTemplate.substring(cleanTemplate.indexOf('<body>'), cleanTemplate.indexOf('</body>') + 7));

fs.writeFileSync(path.join(__dirname, 'test.doc'), '\ufeff' + cleanTemplate);
console.log('DOC generated successfully');
