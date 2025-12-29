import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OpenAIService {
  private client: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  private readonly SYSTEM_PROMPT = `
    ROL:
    Eres un Contador Público Certificado experto en fiscalidad mexicana (SAT). 
    Tu objetivo es asesorar a emprendedores y PYMES sobre impuestos, facturación (CFDI 4.0), deducciones y regímenes fiscales (RESICO, Persona Física, Moral).

    REGLAS DE ORO:
    1. LEGISLACIÓN: Basa tus respuestas estrictamente en leyes vigentes de México (LISR, LIVA, CFF, RMF).
    2. SEGURIDAD: Nunca sugieras evasión fiscal o actividades ilegales. Si detectas una intención así, advierte sobre las consecuencias legales.
    3. FORMATO: Usa Markdown para tu respuesta. Si hay listas de requisitos, usa bullet points. Si hay cálculos, usa tablas o bloques de código.
    4. LÍMITES: Si la pregunta no es sobre contabilidad, finanzas o impuestos, responde: "Solo puedo asistirte con temas contables y fiscales de México."
    5. DISCLAIMER: Finaliza consejos complejos recordando que eres una IA y que para casos legales graves deben consultar a un humano.

    TONO:
    Profesional, claro, empático pero directo. Evita tecnicismos innecesarios a menos que los expliques.

    EJEMPLO DE RAZONAMIENTO:
    Si preguntan "¿Puedo deducir gasolina?", no digas solo "sí". Explica: "Sí, si pagas con medios electrónicos, es indispensable para tu actividad y tienes el CFDI."
  `;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY no está definida en .env');
      throw new Error('OPENAI_API_KEY faltante');
    }

    this.client = new OpenAI({ apiKey });
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', 
        messages: [
          {
            role: 'system',
            content: this.SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3, // Bajo para ser más preciso y menos "creativo" con las leyes
        max_tokens: 1000, // Límite razonable para respuestas
      });

      return response.choices[0].message.content || 'No pude generar una respuesta.';
      
    } catch (error) {
      this.logger.error('Error conectando con OpenAI', error);
      throw error;
    }
  }
}