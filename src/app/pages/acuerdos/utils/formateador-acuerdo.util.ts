import { Factura } from '../interfaces/factura.interface';
import { numberToQuetzalesWords, getRomanNumeral } from '../../../shared/utils/words.util';

export interface AgreementFormatterOptions {
  puntoActa: string;
  encabezado: string;
  cierre: string;
  facturas: Factura[];
  certificar: boolean;
  numeroActa?: string;
  tipoSesion?: string;
  fechaSesion?: string;
  fechaCertificacion?: string;
  nombreSecretaria?: string;
  nombreAlcalde?: string;
  fontStack?: string;
  fontSizeFirmas?: number;
  lineSpacing?: number;
  espacioFirmas?: number;
  cierreCertificacionText?: string;
}

/**
 * Genera el documento consolidado en formato Markdown/HTML para descarga y edición libre.
 */
export function generateAgreementMarkdown(options: AgreementFormatterOptions): string {
  const {
    puntoActa,
    encabezado,
    cierre,
    facturas,
    certificar,
    numeroActa = '',
    tipoSesion = 'Ordinaria',
    fechaSesion = '',
    fechaCertificacion = '',
    nombreSecretaria = '',
    nombreAlcalde = '',
    fontStack = "'Arial Narrow', Arial, sans-serif",
    fontSizeFirmas = 11,
    lineSpacing = 1.0,
    espacioFirmas = 4,
    cierreCertificacionText = ''
  } = options;

  let text = `**<u>${puntoActa}</u>**: ${encabezado}\n\n**ACUERDA**:\n\n`;

  facturas.forEach((fact, idx) => {
    const roman = getRomanNumeral(idx + 1);
    
    const prodTexts = fact.productos.map(p => {
      const pPriceWords = numberToQuetzalesWords(p.precioUnitario, { uppercase: false, includeExact: false });
      const pPriceNum = p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 });
      const cleanDesc = p.descripcion.trim().replace(/\.+$/, '');
      const pGen = p.cantidad === 1 ? '' : (p.genero === 'femenino' ? ' cada una' : ' cada uno');
      return `**${p.cantidad}** ${cleanDesc}, con un valor de **${pPriceWords} (Q.${pPriceNum})**${pGen}`;
    }).join(', ');

    const totalWords = fact.totalEnLetras;
    const totalNum = fact.total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const duenoPart = (fact.dueno && fact.dueno !== 'PROPIETARIO NO ENCONTRADO') ? ` propiedad ${fact.tratamientoDueno} **${fact.dueno}**` : '';

    text += `**${roman}**. Aprobar el pago de la factura serie **${fact.serie}** Número de DTE **${fact.dte}**, de fecha **${fact.fecha}**, a **${fact.establecimiento}**, con dirección en **${fact.direccion}**${duenoPart}, por un valor de: **${totalWords}** (**Q.${totalNum}**), en concepto de pago de: ${prodTexts}${fact.solicitantes ? `, a solicitud ${(fact.prefijoSolicitantes === 'los' || fact.prefijoSolicitantes === 'las') ? 'de ' + fact.prefijoSolicitantes : (fact.prefijoSolicitantes || 'de')} ${fact.solicitantes}` : ''}.\n\n`;
  });

  const cierreRoman = getRomanNumeral(facturas.length + 1);
  text += `**${cierreRoman}**. ${cierre}`;

  if (!certificar) {
    return text;
  }

  const certHeader = `**LA INFRASCRITA SECRETARIA MUNICIPAL DE LA VILLA DE JOYABAJ, DEL DEPARTAMENTO DE QUICHÉ, CERTIFICA:** Tener a la Vista el libro de Actas de la Corporación Municipal en uso debidamente autorizado por la Contraloría General de Cuentas de Quiché, en el cual se encuentra el Acta número **${numeroActa}**, correspondiente a la Sesión Pública **${tipoSesion}**, celebrada con fecha **${fechaSesion}**, en donde aparece el punto que copiado conducentemente establece:`;
  
  const certFooter = `${cierreCertificacionText}\n\n**Y, PARA REMITIR A DONDE CORRESPONDA, COMPULSO LA PRESENTE CERTIFICACIÓN, DEBIDAMENTE CONFRONTADA CON SU ORIGINAL, LA QUE SELLO Y FIRMO, EN LA VILLA DE JOYABAJ, DEPARTAMENTO DE QUICHÉ, A ${fechaCertificacion}.**`;
  
  const espacioFirmasBr = '<br/>'.repeat(espacioFirmas);
  const firmasTable = `<table border="0" cellpadding="0" cellspacing="0" style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 16pt; mso-table-lspace: 0pt; mso-table-rspace: 0pt; mso-table-bspace: 0pt; mso-table-tspace: 0pt; mso-border-alt: none; mso-border-insideh: none; mso-border-insidev: none; border: 1px none; border-top: 1px none; border-bottom: 1px none; border-left: 1px none; border-right: 1px none;"><tr><td style="width: 2.9in; padding: 0; vertical-align: top; mso-border-alt: none; mso-border-left-alt: none; mso-border-top-alt: none; mso-border-bottom-alt: none; mso-border-right-alt: none; border: 1px none; border-top: 1px none; border-bottom: 1px none; border-left: 1px none; border-right: 1px none;"><p style="text-align: center; margin: 0; font-family: ${fontStack}; font-size: ${fontSizeFirmas}pt; line-height: ${lineSpacing * 100}%;">${espacioFirmasBr}<strong>${nombreSecretaria}</strong><br/>Secretaria Municipal</p></td><td style="width: 0.7in; padding: 0; mso-border-alt: none; mso-border-left-alt: none; mso-border-top-alt: none; mso-border-bottom-alt: none; mso-border-right-alt: none; border: 1px none; border-top: 1px none; border-bottom: 1px none; border-left: 1px none; border-right: 1px none;">&nbsp;</td><td style="width: 2.9in; padding: 0; vertical-align: top; mso-border-alt: none; mso-border-left-alt: none; mso-border-top-alt: none; mso-border-bottom-alt: none; mso-border-right-alt: none; border: 1px none; border-top: 1px none; border-bottom: 1px none; border-left: 1px none; border-right: 1px none;"><p style="text-align: center; margin: 0; font-family: ${fontStack}; font-size: ${fontSizeFirmas}pt; line-height: ${lineSpacing * 100}%;">${espacioFirmasBr}Vo. Bo. &nbsp; <strong>${nombreAlcalde}</strong><br/>Alcalde Municipal</p></td></tr></table>`;

  return `${certHeader}\n\n${text}\n\n${certFooter}\n\n${firmasTable}`;
}
