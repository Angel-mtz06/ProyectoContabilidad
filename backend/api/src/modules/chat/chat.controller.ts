import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto'; 
import { GetUser } from '../../common/decorators/get-user.decorator'; 
interface ChatResponse {
  role: 'assistant';
  content: string;
}

@Controller('chat')
@UseGuards(AuthGuard('jwt')) 
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message') 
  async chat(
    @GetUser('id') userId: string, 
    @Body() dto: CreateMessageDto, 
  ): Promise<ChatResponse> {
    
    const response = await this.chatService.ask(userId, dto.content);

    return {
      role: 'assistant',
      content: response,
    };
  }
}