import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
// 👇 CORRECCIÓN DE RUTA: Salimos de 'chat' (..) y entramos a 'files'
import { FilesService } from '../files/files.service'; 

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly filesService: FilesService,
  ) {}

  // 1. Chat normal
  @Post('message')
  async sendMessage(@Body('content') content: string) {
    return await this.chatService.chat(content);
  }

  // 2. Analizar Archivo (Usa FilesService para leer y ChatService para pensar)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('question') question: string,
  ) {
    if (!file) throw new BadRequestException('Falta el archivo');

    // Leemos el contenido con tu servicio de Files existente
    const fileData = await this.filesService.inspectFile(file);

    const prompt = `
      Analiza este archivo (${fileData.type}):
      ${JSON.stringify(fileData.content)}
      
      Pregunta: "${question || 'Resumen'}"
    `;

    // Se lo mandamos a la IA
    const answer = await this.chatService.chat(prompt);

    return { type: fileData.type, analysis: answer };
  }

  // 3. Aprender Leyes (Usa ChatService para subir a OpenAI)
  @Post('learn-law')
  @UseInterceptors(FileInterceptor('file'))
  async learnLaw(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Falta el PDF');
    return await this.chatService.uploadKnowledgeFile(file.buffer, file.originalname);
  }
}