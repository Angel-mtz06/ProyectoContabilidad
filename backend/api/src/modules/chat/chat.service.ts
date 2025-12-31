import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private assistantId: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.assistantId = process.env.OPENAI_ASSISTANT_ID || '';
  }

  async uploadKnowledgeFile(fileBuffer: Buffer, fileName: string) {
    try {
      const tempPath = path.join(__dirname, `temp-${Date.now()}-${fileName}`);
      fs.writeFileSync(tempPath, fileBuffer);

      const file = await this.openai.files.create({
        file: fs.createReadStream(tempPath),
        purpose: 'assistants',
      });

      fs.unlinkSync(tempPath);

      const myAssistant = await this.openai.beta.assistants.retrieve(this.assistantId);
      const openaiAny = this.openai as any;
      
      let vectorStoreModule;
      if (openaiAny.vectorStores) {
          vectorStoreModule = openaiAny.vectorStores;
      } else if (openaiAny.beta && openaiAny.beta.vectorStores) {
          vectorStoreModule = openaiAny.beta.vectorStores;
      } else {
          throw new Error('OpenAI version not supported');
      }

      // @ts-ignore
      let vectorStoreId = myAssistant.tool_resources?.file_search?.vector_store_ids?.[0];

      if (!vectorStoreId) {
        const vectorStore = await vectorStoreModule.create({
          name: 'Biblioteca Fiscal Contable',
        });
        vectorStoreId = vectorStore.id;
        
        await this.openai.beta.assistants.update(this.assistantId, {
          tools: [{ type: 'file_search' }],
          tool_resources: {
            // @ts-ignore
            file_search: { vector_store_ids: [vectorStoreId] }
          }
        });
      }

      await vectorStoreModule.files.create(vectorStoreId, {
        file_id: file.id
      });

      return { status: 'success', fileId: file.id };

    } catch (error) {
      throw new InternalServerErrorException('Error uploading knowledge: ' + error.message);
    }
  }

  async chat(content: string): Promise<string> {
    try {
      if (!this.assistantId) throw new Error('Missing Assistant ID');

      const thread = await this.openai.beta.threads.create();
      
      await this.openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: content,
      });

      // @ts-ignore
      const run = await this.openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: this.assistantId,
      });

      if (run.status !== 'completed') {
         // @ts-ignore
         throw new Error(`Run incomplete. Status: ${run.status}`);
      }

      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];

      if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
        let text = lastMessage.content[0].text.value;
        text = text.replace(/【.*?】/g, ''); 
        return text;
      }

      return '';

    } catch (error) {
      return 'Error: ' + error.message;
    }
  }
}