import JSZip from 'jszip';
import { getDocxTemplateHTML, getDocTemplateHTML } from './plantillas-docx.util';
import { SECT_PR_REGEX, LIST_ITEM_MARKER_REGEX } from '../patterns/patrones-regex';

/**
 * Utilidad para exportar texto con formato a un documento nativo compatible con Microsoft Word (.docx)
 * utilizando el formateador nativo de @turbodocx/html-to-docx (sin altchunks)
 * para asegurar máxima compatibilidad con Microsoft Word Web / Online, Google Docs y dispositivos móviles.
 */
export async function generateDocxBlob(
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial Narrow',
  fontSizeGeneral: number = 11,
  fontSizeCert: number = 11,
  fontSizeIncisos: number = 11,
  fontSizeFirmas: number = 11,
  fontSizeCierreCert: number = 11,
  lineSpacing: number = 1.0
): Promise<Blob> {
  // Asegurar compatibilidad de la variable 'global' en el navegador para la librería @turbodocx/html-to-docx
  if (typeof window !== 'undefined' && !(window as any).global) {
    (window as any).global = window;
  }

  // Configurar la pila de fuentes (font stack) para tipografías especiales como Arial Narrow
  const fontStack = fontFamily === 'Arial Narrow' 
    ? "'Arial Narrow', Arial, sans-serif" 
    : fontFamily;

  // Eliminar espacios, saltos de línea y caracteres invisibles al principio y final
  const cleanContentText = contentText
    .replace(/^[\s\r\n\u200B\uFEFF]+/, '')
    .replace(/[\s\r\n\u200B\uFEFF]+$/, '');

  // Convertir marcas de negrita Markdown **texto** a <strong>texto</strong>
  let htmlContent = cleanContentText
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
    htmlContent.replace(/^(?:<br\s*\/?>|\s)+/i, '').replace(/(?:<br\s*\/?>|\s)+$/i, ''),
    fontStack,
    fontSizeGeneral,
    fontSizeCert,
    fontSizeIncisos,
    fontSizeCierreCert,
    lineSpacing
  );

  // Limpiar cualquier párrafo vacío inicial o final que pueda haber generado el analizador
  paragraphs = paragraphs
    .replace(/^(?:<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;)?\s*<\/p>|\s)+/i, '')
    .replace(/(?:<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;)?\s*<\/p>|\s)+$/i, '');

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
        newStyle += ';mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;';
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
  const documentTemplateHTML = getDocxTemplateHTML(
    paragraphs,
    fontStack,
    fontSizeGeneral,
    fontSizeIncisos,
    lineSpacing
  );

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
    fontSize: fontSizeIncisos * 2,
    lang: 'es-GT',
    table: {
      borderOptions: {
        size: 1,
        stroke: 'none',
        color: 'transparent'
      }
    }
  };

  // Cargar de forma dinámica la versión local adaptada para navegador de la librería html-to-docx
  // @ts-ignore
  const module = await import('./html-to-docx-browser');
  const HTMLtoDOCX = module.default as any;

  const cleanTemplateHTML = documentTemplateHTML
    .replace(/\r?\n/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  // Convertir HTML a un Blob de DOCX nativo compatible con Word Online
  let docxContent = await HTMLtoDOCX(cleanTemplateHTML, null, documentOptions);

  // Post-procesar para mover <w:sectPr> al final de <w:body> para evitar el salto de línea al inicio en MS Word
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(docxContent);
    const docXmlFile = loadedZip.file('word/document.xml');
    if (docXmlFile) {
      let docXml = await docXmlFile.async('string');
      const bodyStartIdx = docXml.indexOf('<w:body>');
      if (bodyStartIdx !== -1) {
        const match = docXml.substring(bodyStartIdx).match(SECT_PR_REGEX);
        if (match) {
          const sectPrStr = match[0];
          let contentAfterBody = docXml.substring(bodyStartIdx + 8);
          contentAfterBody = contentAfterBody.replace(sectPrStr, '');
          const bodyEndIdx = contentAfterBody.indexOf('</w:body>');
          if (bodyEndIdx !== -1) {
            docXml = docXml.substring(0, bodyStartIdx + 8) +
                     contentAfterBody.substring(0, bodyEndIdx) +
                     sectPrStr +
                     contentAfterBody.substring(bodyEndIdx);
            loadedZip.file('word/document.xml', docXml);
            docxContent = await loadedZip.generateAsync({ type: 'blob' });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al post-procesar el archivo .docx:', error);
  }

  return docxContent instanceof Blob 
    ? docxContent 
    : new Blob([docxContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
}

export async function downloadAsDocx(
  filename: string, 
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial Narrow',
  fontSizeGeneral: number = 11,
  fontSizeCert: number = 11,
  fontSizeIncisos: number = 11,
  fontSizeFirmas: number = 11,
  fontSizeCierreCert: number = 11,
  lineSpacing: number = 1.0
): Promise<void> {
  try {
    const blob = await generateDocxBlob(
      contentText, pageSize, marginTop, marginRight, marginBottom, marginLeft,
      fontFamily, fontSizeGeneral, fontSizeCert, fontSizeIncisos, fontSizeFirmas, fontSizeCierreCert, lineSpacing
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFilename = filename.endsWith('.docx') ? filename : filename + '.docx';
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar o descargar el archivo .docx nativo:', error);
  }
}

/**
 * Utilidad para exportar texto con formato a un documento compatible con Microsoft Word (.doc)
 * utilizando el formato HTML-to-Wordprocessing clásico (HTML enmascarado como .doc)
 * como alternativa de respaldo en caso de problemas con el formato DOCX.
 */
export function generateDocBlob(
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial Narrow',
  fontSizeGeneral: number = 11,
  fontSizeCert: number = 11,
  fontSizeIncisos: number = 11,
  fontSizeFirmas: number = 11,
  fontSizeCierreCert: number = 11,
  lineSpacing: number = 1.0
): Blob {
  const fontStack = fontFamily === 'Arial Narrow' 
    ? "'Arial Narrow', Arial, sans-serif" 
    : fontFamily;

  // Eliminar espacios, saltos de línea y caracteres invisibles al principio y final
  const cleanContentText = contentText
    .replace(/^[\s\r\n\u200B\uFEFF]+/, '')
    .replace(/[\s\r\n\u200B\uFEFF]+$/, '');

  let htmlContent = cleanContentText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  let tablePart = '';
  const tableIndex = htmlContent.indexOf('<table');
  if (tableIndex !== -1) {
    tablePart = htmlContent.substring(tableIndex);
    htmlContent = htmlContent.substring(0, tableIndex);
  }

  let paragraphs = parseContentToHtml(
    htmlContent.replace(/^(?:<br\s*\/?>|\s)+/i, '').replace(/(?:<br\s*\/?>|\s)+$/i, ''),
    fontStack,
    fontSizeGeneral,
    fontSizeCert,
    fontSizeIncisos,
    fontSizeCierreCert,
    lineSpacing
  );

  // Limpiar cualquier párrafo vacío inicial o final que pueda haber generado el analizador
  paragraphs = paragraphs
    .replace(/^(?:<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;)?\s*<\/p>|\s)+/i, '')
    .replace(/(?:<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;)?\s*<\/p>|\s)+$/i, '');

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
        newStyle += ';mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;';
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

  const documentTemplate = getDocTemplateHTML(
    paragraphs,
    selectedSize,
    selectedMargin,
    fontStack,
    fontSizeGeneral,
    fontSizeIncisos,
    lineSpacing
  );

  const cleanTemplate = documentTemplate
    .replace(/\r?\n/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  return new Blob([cleanTemplate], {
    type: 'application/msword;charset=utf-8'
  });
}

export function downloadAsDoc(
  filename: string, 
  contentText: string,
  pageSize: 'letter' | 'legal' | 'a4' | 'foolscap' = 'letter',
  marginTop: number = 1.0,
  marginRight: number = 1.0,
  marginBottom: number = 1.0,
  marginLeft: number = 1.0,
  fontFamily: string = 'Arial Narrow',
  fontSizeGeneral: number = 11,
  fontSizeCert: number = 11,
  fontSizeIncisos: number = 11,
  fontSizeFirmas: number = 11,
  fontSizeCierreCert: number = 11,
  lineSpacing: number = 1.0
): void {
  try {
    const blob = generateDocBlob(
      contentText, pageSize, marginTop, marginRight, marginBottom, marginLeft,
      fontFamily, fontSizeGeneral, fontSizeCert, fontSizeIncisos, fontSizeFirmas, fontSizeCierreCert, lineSpacing
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFilename = filename.endsWith('.doc') ? filename : filename + '.doc';
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar o descargar el archivo .doc clásico:', error);
  }
}

function parseContentToHtml(
  htmlContent: string,
  fontStack: string,
  fontSizeGeneral: number,
  fontSizeCert: number,
  fontSizeIncisos: number,
  fontSizeCierreCert: number,
  lineSpacing: number
): string {
  const lines = htmlContent
    .split(/<br\s*\/?>/i)
    .map(p => p.replace(/^[\s\r\n\u200B\uFEFF]+/, '').replace(/[\s\r\n\u200B\uFEFF]+$/, ''))
    .filter(p => p.length > 0);

  let resultHtml = '';
  let inList = false;
  let hasReachedAcuerda = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const plainText = line.replace(/<[^>]*>/g, '').trim();

    const upperText = plainText.toUpperCase();
    if (upperText === 'ACUERDA' || upperText === 'ACUERDA:' || upperText === 'ACUERDAN' || upperText === 'ACUERDAN:' || upperText === 'RESUELVE' || upperText === 'RESUELVE:') {
      if (inList) {
        resultHtml += '</ol>';
        inList = false;
      }
      hasReachedAcuerda = true;
      resultHtml += `<p class="MsoNormal" lang="es-GT" style="text-align:center;line-height:${lineSpacing * 100}%;margin-top:0pt;margin-bottom:0pt;font-size:${fontSizeGeneral}pt;font-family:${fontStack};mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;"><strong>${plainText}</strong></p>`;
      continue;
    }

    const isCierre = line.includes('…No habiendo más…') || line.includes('CERTIFICO:');
    const isCert = line.includes('LA INFRASCRITA SECRETARIA') || line.includes('Y, PARA REMITIR');

    const match = line.match(LIST_ITEM_MARKER_REGEX);

    if (match && hasReachedAcuerda && !isCierre && !isCert) {
      const content = match[2].trim();
      
      if (!inList) {
        // Especificar type="I" y list-style-type: upper-roman en el estilo para forzar el tipo romano nativo de Word
        resultHtml += `<ol type="I" lang="es-GT" style="list-style-type:upper-roman;margin-top:0pt;margin-bottom:0pt;padding-left:0.5in;font-family:${fontStack};font-size:${fontSizeIncisos}pt;line-height:${lineSpacing * 100}%;mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;">`;
        inList = true;
      }
      resultHtml += `<li lang="es-GT" style="text-align:justify;font-family:${fontStack};font-size:${fontSizeIncisos}pt;margin-bottom:0pt;line-height:${lineSpacing * 100}%;mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;">${content}</li>`;
    } else {
      if (inList) {
        resultHtml += '</ol>';
        inList = false;
      }
      // Desactivamos la bandera al toparnos con el cierre de la resolución o la certificación
      if (hasReachedAcuerda && (isCierre || isCert)) {
        hasReachedAcuerda = false;
      }

      const size = isCierre ? fontSizeCierreCert : isCert ? fontSizeCert : fontSizeGeneral;
      resultHtml += `<p class="MsoNormal" lang="es-GT" style="text-align:justify;line-height:${lineSpacing * 100}%;margin-top:0pt;margin-bottom:0pt;font-size:${size}pt;font-family:${fontStack};mso-ansi-language:ES-GT;mso-fareast-language:ES-GT;mso-bidi-language:ES-GT;">${line}</p>`;
    }
  }

  if (inList) {
    resultHtml += '</ol>';
  }

  return resultHtml;
}
