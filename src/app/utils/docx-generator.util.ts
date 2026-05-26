/**
 * Utilidad para exportar texto con formato a un documento nativo compatible con Microsoft Word (.docx)
 * utilizando el formateador nativo de @turbodocx/html-to-docx (sin altchunks)
 * para asegurar máxima compatibilidad con Microsoft Word Web / Online, Google Docs y dispositivos móviles.
 */
export async function downloadAsDocx(
  filename: string, 
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial',
  fontSizeGeneral: number = 12,
  fontSizeCert: number = 12,
  fontSizeIncisos: number = 12,
  fontSizeFirmas: number = 12,
  fontSizeCierreCert: number = 12
): Promise<void> {
  // Asegurar compatibilidad de la variable 'global' en el navegador para la librería @turbodocx/html-to-docx
  if (typeof window !== 'undefined' && !(window as any).global) {
    (window as any).global = window;
  }

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

  // Envolver en párrafos y listas nativas de Word
  let paragraphs = parseContentToHtml(
    htmlContent,
    fontStack,
    fontSizeGeneral,
    fontSizeCert,
    fontSizeIncisos,
    fontSizeCierreCert
  );

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

  // Definición de Tamaños de Hoja (en pulgadas y convirtiendo a twips: 1 in = 1440 twips)
  let width = 12240; // 8.5 in * 1440
  let height = 15840; // 11.0 in * 1440

  if (pageSize === 'legal') {
    height = 20160; // 14.0 in * 1440
  } else if (pageSize === 'a4') {
    width = 11909; // 8.27 in * 1440
    height = 16834; // 11.69 in * 1440
  } else if (pageSize === 'foolscap') {
    height = 18720; // 13.0 in * 1440
  }

  // Plantilla HTML compatible con MS Word con dimensiones dinámicas
  const documentTemplateHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Acuerdo Municipal</title>
      <style>
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
        ol, li {
          font-family: ${fontStack};
          font-size: ${fontSizeIncisos}pt;
        }
      </style>
    </head>
    <body>
      ${paragraphs}
    </body>
    </html>
  `;

  // Configuración de opciones para el generador nativo
  const documentOptions = {
    orientation: 'portrait' as const,
    pageSize: {
      width: width,
      height: height
    },
    margins: {
      top: Math.round(marginTop * 1440),
      right: Math.round(marginRight * 1440),
      bottom: Math.round(marginBottom * 1440),
      left: Math.round(marginLeft * 1440),
      header: 720,
      footer: 720,
      gutter: 0
    },
    font: fontFamily,
    fontSize: fontSizeIncisos * 2
  };

  // Cargar de forma dinámica la versión local adaptada para navegador de la librería html-to-docx
  // @ts-ignore
  const module = await import('./html-to-docx-browser.js');
  const HTMLtoDOCX = module.default;

  // Convertir HTML a un Blob de DOCX nativo compatible con Word Online
  HTMLtoDOCX(documentTemplateHTML, null, documentOptions)
    .then((docxContent: any) => {
      const blob = docxContent instanceof Blob 
        ? docxContent 
        : new Blob([docxContent], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Guardar como .docx nativo
      const cleanFilename = filename.endsWith('.docx') ? filename : filename + '.docx';
      link.download = cleanFilename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch((error: any) => {
      console.error('Error al generar el archivo .docx nativo:', error);
    });
}

/**
 * Utilidad para exportar texto con formato a un documento compatible con Microsoft Word (.doc)
 * utilizando el formato HTML-to-Wordprocessing clásico (HTML enmascarado como .doc)
 * como alternativa de respaldo en caso de problemas con el formato DOCX.
 */
export function downloadAsDoc(
  filename: string, 
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial',
  fontSizeGeneral: number = 12,
  fontSizeCert: number = 12,
  fontSizeIncisos: number = 12,
  fontSizeFirmas: number = 12,
  fontSizeCierreCert: number = 12
): void {
  const fontStack = fontFamily === 'Arial Narrow' 
    ? "'Arial Narrow', Arial, sans-serif" 
    : fontFamily;

  let htmlContent = contentText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  let tablePart = '';
  const tableIndex = htmlContent.indexOf('<table');
  if (tableIndex !== -1) {
    tablePart = htmlContent.substring(tableIndex);
    htmlContent = htmlContent.substring(0, tableIndex);
  }

  let paragraphs = parseContentToHtml(
    htmlContent,
    fontStack,
    fontSizeGeneral,
    fontSizeCert,
    fontSizeIncisos,
    fontSizeCierreCert
  );

  if (tablePart) {
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

  const sizes = {
    letter: '8.5in 11.0in',
    legal: '8.5in 14.0in',
    a4: '8.27in 11.69in',
    foolscap: '8.5in 13.0in'
  };

  const selectedSize = sizes[pageSize] || sizes.letter;
  const selectedMargin = `${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in`;

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
        ol, li {
          font-family: ${fontStack};
          font-size: ${fontSizeIncisos}pt;
        }
      </style>
    </head>
    <body>
      ${paragraphs}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + documentTemplate], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const cleanFilename = filename.endsWith('.doc') ? filename : filename + '.doc';
  link.download = cleanFilename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseContentToHtml(
  htmlContent: string,
  fontStack: string,
  fontSizeGeneral: number,
  fontSizeCert: number,
  fontSizeIncisos: number,
  fontSizeCierreCert: number
): string {
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
      resultHtml += `<p class="MsoNormal" style="text-align:center;line-height:115%;margin-top:0pt;margin-bottom:0pt;font-size:${fontSizeGeneral}pt;font-family:${fontStack};"><strong>ACUERDA:</strong></p>`;
      continue;
    }

    const isCierre = line.includes('…No habiendo más…') || line.includes('CERTIFICO:');
    const isCert = line.includes('LA INFRASCRITA SECRETARIA') || line.includes('Y, PARA REMITIR');

    // Expresión regular mejorada: exige que el número romano o arábigo esté seguido de un punto (.) y un espacio.
    const match = line.match(/^\s*(?:<strong>|<b>|<u>|<span[^>]*>)*([IVXLCDM]+|\d+)(?:\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)*\s*\.\s*|\s*\.\s*(?:<\/strong>|<\/b>|<\/u>|<\/span>)*\s*)\s*(.*)/);

    if (match && hasReachedAcuerda && !isCierre && !isCert) {
      const content = match[2].trim();
      
      if (!inList) {
        // Especificar list-style-type: upper-roman en el estilo para forzar el tipo romano nativo de Word
        resultHtml += `<ol style="list-style-type:upper-roman;margin-top:0pt;margin-bottom:0pt;padding-left:0.5in;font-family:${fontStack};font-size:${fontSizeIncisos}pt;line-height:115%;">`;
        inList = true;
      }
      resultHtml += `<li style="text-align:justify;font-family:${fontStack};font-size:${fontSizeIncisos}pt;margin-bottom:0pt;line-height:115%;">${content}</li>`;
    } else {
      if (inList) {
        resultHtml += '</ol>';
        inList = false;
      }
      // Si ya pasamos la sección ACUERDA y nos topamos con un párrafo que no es inciso,
      // desactivamos la bandera para evitar falsos positivos en el resto del documento (firmas, cierre de certificación, etc.)
      if (hasReachedAcuerda && (isCierre || isCert || !match)) {
        hasReachedAcuerda = false;
      }

      const size = isCierre ? fontSizeCierreCert : isCert ? fontSizeCert : fontSizeGeneral;
      resultHtml += `<p class="MsoNormal" style="text-align:justify;line-height:115%;margin-top:0pt;margin-bottom:0pt;font-size:${size}pt;font-family:${fontStack};">${line}</p>`;
    }
  }

  if (inList) {
    resultHtml += '</ol>';
  }

  return resultHtml;
}
