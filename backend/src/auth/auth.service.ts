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
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) { }

  async getAllUsers() {
    const users = await this.userRepo.find({
      relations: ['role', 'reservations'],
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => {
      // REJECTED සහ CANCELLED නොවන valid reservations පමණක් filter කර ගැනීම
      const validReservations = user.reservations
        ? user.reservations.filter(
          (r: any) => r.status !== 'REJECTED' && r.status !== 'CANCELLED'
        )
        : [];

      return {
        ...user,
        _count: {
          reservations: validReservations.length,
        },
      };
    });
  }

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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_key_12345',
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
      // Return a generic success message to prevent user enumeration security risks
      return { message: 'If an account exists, a password reset token has been sent.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET || 'secret', expiresIn: '15m' },
    );

    // Send the token via your MailService
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Password reset instructions sent to your email.' };
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

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_12345',
      expiresIn: '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || 'super_secret_refresh_key_12345',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}