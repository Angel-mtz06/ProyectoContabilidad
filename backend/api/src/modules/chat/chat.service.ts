import { 
  Injectable, 
  ServiceUnavailableException, 
  InternalServerErrorException,
  ForbiddenException, // Para el bloqueo de pago
  UnauthorizedException // Para cuando no encuentra al usuario
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAIService } from '../../common/openai/openai.service';
import { Role } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openAI: OpenAIService,
  ) {}

  async ask(userId: string, message: string): Promise<string> {
    try {
      // 1. Obtener datos del usuario (Plan y Conteo)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      // ✅ CORRECCIÓN: Validamos que el usuario exista antes de leer sus datos
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // 🛑 VALIDACIÓN DE PAGO (Lógica Freemium)
      const MAX_FREE_MESSAGES = 3;

      if (user.plan === 'FREE' && user.messageCount >= MAX_FREE_MESSAGES) {
        throw new ForbiddenException(
          'Has alcanzado tu límite gratuito (3 mensajes). Actualiza a Premium para continuar.'
        );
      }

      // 2. Buscar o crear chat
      let chat = await this.prisma.chat.findUnique({
        where: { userId },
      });

      if (!chat) {
        chat = await this.prisma.chat.create({
          data: { userId },
        });
      }

      // 3. Guardar mensaje del usuario
      await this.prisma.message.create({
        data: {
          chatId: chat.id,
          role: Role.user,
          content: message,
        },
      });

      // 4. Llamar a OpenAI
      const aiResponse = await this.openAI.chat(message);

      // 5. Guardar respuesta de la IA
      await this.prisma.message.create({
        data: {
          chatId: chat.id,
          role: Role.assistant,
          content: aiResponse,
        },
      });

      // ➕ INCREMENTAR CONTADOR (Solo si es Free)
      if (user.plan === 'FREE') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { messageCount: user.messageCount + 1 },
        });
      }

      return aiResponse;

    } catch (error: any) {
      // Si el error es de negocio (Pago o Auth), lo dejamos pasar al usuario
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('ChatService error:', error);
      
      if (error?.status === 429) {
        throw new ServiceUnavailableException('La IA está saturada, intenta luego');
      }
      
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
}