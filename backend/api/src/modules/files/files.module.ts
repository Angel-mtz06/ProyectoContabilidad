import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { OpenAIService } from '../../common/openai/openai.service'; 
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  controllers: [FilesController],
  providers: [FilesService, OpenAIService], 
  exports: [FilesService], 
})
export class FilesModule {}