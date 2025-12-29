import { Injectable, BadRequestException } from '@nestjs/common';
import * as xml2js from 'xml2js';
import * as XLSX from 'xlsx';
// 👇 IMPORTACIÓN SEGURA: Usamos require para evitar líos de tipos con la nueva librería
const PDFParser = require('pdf2json');

@Injectable()
export class FilesService {
  
  // 1. Procesar XML
  private async parseXml(buffer: Buffer) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(buffer.toString());
    return { type: 'XML (Factura)', content: result };
  }

  // 2. Procesar PDF (NUEVA VERSIÓN con pdf2json) 📄✅
  private parsePdf(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Instanciamos la clase explícitamente (esto arregla tu error de 'new')
        const parser = new PDFParser(this, 1); // El '1' indica que queremos texto plano

        // Evento: Si hay error
        parser.on("pdfParser_dataError", (errData) => {
           console.error('🚨 ERROR PDF2JSON:', errData.parserError);
           reject(new BadRequestException('No se pudo leer el PDF.'));
        });

        // Evento: Si termina bien
        parser.on("pdfParser_dataReady", (pdfData) => {
           // Extraemos el texto crudo
           const rawText = parser.getRawTextContent();
           
           if (!rawText || rawText.trim().length === 0) {
             resolve({ 
               type: 'PDF (Imagen)', 
               content: 'El PDF fue procesado pero no contiene texto seleccionable.' 
             });
           } else {
             resolve({ 
               type: 'PDF (Documento)', 
               content: rawText.substring(0, 3000) // Limitamos caracteres
             });
           }
        });

        // ¡A procesar!
        parser.parseBuffer(buffer);

      } catch (e) {
        reject(new BadRequestException('Error interno iniciando el lector de PDF.'));
      }
    });
  }

  // 3. Procesar Excel
  private parseExcel(buffer: Buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; 
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet); 
      
      return { 
        type: 'Excel (Hoja de Cálculo)', 
        content: data.slice(0, 50) 
      };
    } catch (e) {
      throw new BadRequestException('No se pudo leer el archivo Excel.');
    }
  }

  // Función Principal
  async inspectFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se envió ningún archivo');

    const mime = file.mimetype;

    if (mime === 'text/xml' || file.originalname.endsWith('.xml')) {
      return this.parseXml(file.buffer);
    }
    
    if (mime === 'application/pdf') {
      // Como ahora devuelve una promesa, usamos await
      return await this.parsePdf(file.buffer);
    }

    if (
      mime.includes('spreadsheet') || 
      mime.includes('excel') || 
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      return this.parseExcel(file.buffer);
    }

    throw new BadRequestException(`Formato no soportado: ${mime}`);
  }
}