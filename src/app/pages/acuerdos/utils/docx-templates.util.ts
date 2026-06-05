/**
 * Plantillas HTML y estilos para exportar documentos de Microsoft Word (.docx y .doc)
 */

export function getDocxTemplateHTML(
  paragraphs: string,
  fontStack: string,
  fontSizeGeneral: number,
  fontSizeIncisos: number,
  lineSpacing: number
): string {
  return `
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Acuerdo Municipal</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: ${fontStack};
          font-size: ${fontSizeGeneral}pt;
          color: #000000;
          line-height: ${lineSpacing};
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        p.MsoNormal {
          margin: 0in;
          margin-bottom: 0pt;
          text-align: justify;
          font-family: ${fontStack};
          font-size: ${fontSizeGeneral}pt;
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        strong {
          font-weight: bold;
        }
        ol, li {
          font-family: ${fontStack};
          font-size: ${fontSizeIncisos}pt;
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        table {
          border: none;
          border-width: 0px;
          border-style: none;
          border-collapse: collapse;
          mso-border-alt: none;
          mso-border-insideh: none;
          mso-border-insidev: none;
        }
        td, tr {
          border: none;
          border-width: 0px;
          border-style: none;
          mso-border-alt: none;
          mso-border-left-alt: none;
          mso-border-top-alt: none;
          mso-border-bottom-alt: none;
          mso-border-right-alt: none;
        }
      </style>
    </head>
    <body>${paragraphs}</body>
    </html>
  `;
}

export function getDocTemplateHTML(
  paragraphs: string,
  selectedSize: string,
  selectedMargin: string,
  fontStack: string,
  fontSizeGeneral: number,
  fontSizeIncisos: number,
  lineSpacing: number
): string {
  return `
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
          size: ${selectedSize};
          margin: ${selectedMargin};
        }
        body {
          margin: 0;
          padding: 0;
          font-family: ${fontStack};
          font-size: ${fontSizeGeneral}pt;
          color: #000000;
          line-height: ${lineSpacing};
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        p.MsoNormal {
          margin: 0in;
          margin-bottom: 0pt;
          text-align: justify;
          font-family: ${fontStack};
          font-size: ${fontSizeGeneral}pt;
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        strong {
          font-weight: bold;
        }
        ol, li {
          font-family: ${fontStack};
          font-size: ${fontSizeIncisos}pt;
          mso-ansi-language: ES-GT;
          mso-fareast-language: ES-GT;
          mso-bidi-language: ES-GT;
        }
        table {
          border: none;
          border-width: 0px;
          border-style: none;
          border-collapse: collapse;
          mso-border-alt: none;
          mso-border-insideh: none;
          mso-border-insidev: none;
        }
        td, tr {
          border: none;
          border-width: 0px;
          border-style: none;
          mso-border-alt: none;
          mso-border-left-alt: none;
          mso-border-top-alt: none;
          mso-border-bottom-alt: none;
          mso-border-right-alt: none;
        }
      </style>
    </head>
    <body>${paragraphs}</body>
    </html>
  `;
}
