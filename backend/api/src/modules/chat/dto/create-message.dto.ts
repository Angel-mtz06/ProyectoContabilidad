import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @IsString({ message: 'El mensaje debe ser texto' })
  @MaxLength(500, { message: 'El mensaje excede los 500 caracteres' })
  content: string; 
}