import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards,
  Body 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { OpenAIService } from '../../common/openai/openai.service';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('question') question: string,
  ) {
    // 1. Procesar el archivo
    const fileData = await this.filesService.inspectFile(file);

    // 2. Si no hay pregunta, devolvemos el contenido extraído
    if (!question) {
      return fileData;
    }

    // 3. Si HAY pregunta, armamos el prompt usando .content
    // 👇 AQUÍ ESTABA EL ERROR, CAMBIAMOS .datos POR .content
    const jsonString = JSON.stringify(fileData.content, null, 2);
    
    const prompt = `
      Analiza el siguiente documento (${fileData.type}):
      
      --- CONTENIDO DEL ARCHIVO ---
      ${jsonString}
      -----------------------------

      PREGUNTA DEL USUARIO:
      ${question}
    `;

    // 4. Llamamos a la IA
    const aiResponse = await this.openAIService.chat(prompt);

    return {
      analysis: aiResponse,
      fileData: fileData.content // 👈 AQUÍ TAMBIÉN CAMBIAMOS POR .content
    };
  }
}