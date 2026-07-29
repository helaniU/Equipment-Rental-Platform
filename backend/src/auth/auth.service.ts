import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Role, RoleType } from '../database/entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const customerRole = await this.roleRepo.findOne({ where: { name: RoleType.CUSTOMER } });
    if (!customerRole) {
      throw new BadRequestException('Customer role not initialized');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      phone: dto.phone,
      role: customerRole,
    });

    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['role'], // Populates user.role relation
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });
      if (!user) throw new UnauthorizedException('Invalid refresh token');
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      return { message: 'If an account exists, a password reset token has been sent.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET || 'secret', expiresIn: '15m' },
    );

    return { message: 'Password reset token generated', resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: process.env.JWT_SECRET || 'secret',
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('User not found');

      user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepo.save(user);

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }

  private generateTokens(user: User) {
    const roleName = user.role?.name || RoleType.CUSTOMER;
    const payload = { sub: user.id, email: user.email, role: roleName };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: { name: roleName }, // Sends role as { name: "ADMIN" } to match AuthContext!
      },
    };
  }
}