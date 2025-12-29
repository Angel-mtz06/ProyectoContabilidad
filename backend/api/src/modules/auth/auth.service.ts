import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Ajusta la ruta si es necesario
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // REGISTRO
  async register(dto: RegisterDto) {
    // Verificar si el usuario ya existe
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('El email ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    // (Login automático al registrarse)
    return this.generateJwt(newUser.id, newUser.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateJwt(user.id, user.email);
  }

  private generateJwt(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: email
      }
    };
  }
}