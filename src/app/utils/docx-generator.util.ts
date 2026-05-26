/**
 * Utilidad para exportar texto con formato a un documento compatible con Microsoft Word (.doc / .docx)
 * utilizando el formato HTML-to-Wordprocessing con configuraciones de página y márgenes numéricos precisos.
 */

export function downloadAsDocx(
  filename: string, 
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial',
  fontSizeGeneral: number = 12,
  fontSizeCert: number = 12,
  fontSizeIncisos: number = 12,
  fontSizeFirmas: number = 12
): void {
  // Configurar la pila de fuentes (font stack) para tipografías especiales como Arial Narrow
  const fontStack = fontFamily === 'Arial Narrow' 
    ? "'Arial Narrow', Arial, sans-serif" 
    : fontFamily;

  // Convertir marcas de negrita Markdown **texto** a <strong>texto</strong>
  let htmlContent = contentText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas
    .replace(/\n/g, '<br/>'); // Saltos de línea

  // Si hay una tabla al final (para firmas), la extraemos para no romperla al separar por <br/>
  let tablePart = '';
  const tableIndex = htmlContent.indexOf('<table');
  if (tableIndex !== -1) {
    tablePart = htmlContent.substring(tableIndex);
    htmlContent = htmlContent.substring(0, tableIndex);
  }

  // Envolver en párrafos de Word
  let paragraphs = htmlContent
    .split(/<br\s*\/?>/i)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      const plainText = p.replace(/<[^>]*>/g, '').trim();
      if (plainText === 'ACUERDA' || plainText === 'ACUERDA:') {
        return `<p class="MsoNormal" style="text-align:center;line-height:115%;margin-top:0pt;margin-bottom:0pt;font-size:${fontSizeGeneral}pt;font-family:${fontStack};"><strong>ACUERDA:</strong></p>`;
      }
      
      // Clasificar según contenido: Certificación, Inciso, o General
      const isCert = p.includes('LA INFRASCRITA SECRETARIA') || p.includes('Y, PARA REMITIR') || p.includes('…No habiendo más…') || p.includes('CERTIFICO:');
      const isInciso = /^\s*(?:<strong>)?[IVXLCDM\d]+(?:<\/strong>)?\./i.test(p);
      
      const size = isCert ? fontSizeCert : isInciso ? fontSizeIncisos : fontSizeGeneral;
      
      if (isInciso) {
        return `<p class="MsoNormal" style="text-align:justify;line-height:115%;margin-left:0.5in;text-indent:-0.25in;margin-top:0pt;margin-bottom:0pt;font-size:${size}pt;font-family:${fontStack};">${p}</p>`;
      }
      
      return `<p class="MsoNormal" style="text-align:justify;line-height:115%;margin-top:0pt;margin-bottom:0pt;font-size:${size}pt;font-family:${fontStack};">${p}</p>`;
    })
    .join('');

  if (tablePart) {
    // Reemplazar la tipografía y el tamaño en las celdas de firmas
    let modifiedTable = tablePart
      .replace(/font-family:[^;"]+/g, `font-family:${fontStack}`)
      .replace(/font-size:[^;"]+/g, `font-size:${fontSizeFirmas}pt`)
      .replace(/style="([^"]*)"/g, (match, styleContent) => {
        let newStyle = styleContent;
        if (!newStyle.includes('font-family')) {
          newStyle += `;font-family:${fontStack}`;
        }
        if (!newStyle.includes('font-size')) {
          newStyle += `;font-size:${fontSizeFirmas}pt`;
        }
        return `style="${newStyle}"`;
      });
    paragraphs += modifiedTable;
  }

  // Definición de Tamaños de Hoja (pulgadas)
  const sizes = {
    letter: '8.5in 11.0in', // Carta
    legal: '8.5in 14.0in',  // Oficio (Guatemala)
    a4: '8.27in 11.69in'    // A4
  };

  const selectedSize = sizes[pageSize] || sizes.letter;
  const selectedMargin = `${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in`;

  // Plantilla HTML compatible con MS Word con dimensiones dinámicas
  const documentTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
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
          size: ${selectedSize};
          margin: ${selectedMargin};
        }
        body {
          font-family: ${fontStack};
          font-size: ${fontSizeGeneral}pt;
          color: #000000;
          line-height: 1.15;
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
      </style>
    </head>
    <body>
      ${paragraphs}
    </body>
    </html>
  `;

  // Crear un blob de tipo aplicación de Word con codificación UTF-8
  const blob = new Blob(['\ufeff' + documentTemplate], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Guardar como .doc ya que Word abre este formato de forma más directa
  const cleanFilename = filename.endsWith('.doc') ? filename : filename + '.doc';
  link.download = cleanFilename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
