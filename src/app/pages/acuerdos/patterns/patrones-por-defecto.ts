import { PatronesExtraccion } from '../interfaces/patrones-extraccion.interface';

export const DEFAULT_EXTRACTION_PATTERNS: PatronesExtraccion = {
  dte: '(?:Número de DTE|DTE|Autorización|UUID):?\\s*([0-9a-fA-F\\-]{8,36}|[0-9]+)',
  serie: '(?:SERIE|Serie):?\\s*([0-9A-Z]+)',
  numero: '(?:NÚMERO|Número|No\\.):?\\s*([0-9]+)',
  fecha: '(?:Fecha de emisi[oó]n|Fecha y hora de emisi[oó]n|Fecha|Emisi[oó]n):?\\s*([0-9]{1,2}[/-][a-zA-ZáéíóúÁÉÍÓÚ]+[/-][0-9]{2,4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\\s+de\\s+[a-zA-ZáéíóúÁÉÍÓÚ]+\\s+de\\s+[0-9]{4})',
  establecimiento: '(?:(?:[0-9a-fA-F\\-]{36})?\\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.\\&\\/\\,\\"\\\'«»“”‘’]{3,50})(?=\\s*Serie:)|(?:Nombre Comercial|Establecimiento|Nombre del Emisor|Emisor):?\\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.\\&\\/\\,\\"\\\'«»“”‘’]{3,50})(?=\\s*(?:Serie:|Dirección:|NIT:|Receptor:|$)))',
  direccion: '(?:Dirección del Establecimiento|Dirección Comercial|Dirección|Ubicado en):\\s*([0-9a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.,/]+?)(?=\\s*(?:Numero Acceso|NIT|Receptor|Fecha|Moneda|$))|\\b[0-9]{8,12}\\s+([0-9a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\-\\.,/]{10,100})(?=\\s*Numero Acceso)',
  dueno: '(?:Propietario|Dueño|Nombre del Propietario|Representante Legal|Nombre del Emisor|Nombre Emisor|Razon Social|Razón Social|Emisor|Contribuyente):?\\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\,\\.]{3,60})(?=\\s*(?:Serie:|Dirección:|NIT:|Receptor:|$))|(?:Factura[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*\\s+\\d+\\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ\\s\\,\\.]{3,60})(?=\\s+NÚMERO DE AUTORIZACIÓN)'
};
