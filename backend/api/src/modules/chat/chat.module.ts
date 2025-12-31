import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenAIService } from '../../common/openai/openai.service';
import { FilesModule } from '../files/files.module'; 

@Module({
  imports: [FilesModule], 
  controllers: [ChatController],
  providers: [ChatService, OpenAIService],
})
export class ChatModule {}