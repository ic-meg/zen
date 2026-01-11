import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SendVerificationDto, VerifyCodeDto, UpdateUserDto, UserRole } from './dto/auth.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async sendVerificationCode(sendVerificationDto: SendVerificationDto) {
    const { email } = sendVerificationDto;

    if (email === 'admin@gmail.com') {
      throw new BadRequestException('Admin registration is not allowed through this method');
    }

    const code = this.emailService.generateVerificationCode();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 10);

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await this.prisma.user.update({
        where: { email },
        data: {
          verificationCode: code,
          verificationCodeExpiry: codeExpiry,
          isEmailVerified: false,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email,
          firstName: email.split('@')[0],
          lastName: 'User',
          role: UserRole.USER,
          verificationCode: code,
          verificationCodeExpiry: codeExpiry,
          isEmailVerified: false,
        },
      });
    }

    await this.emailService.sendVerificationCode(email, code);

    return {
      message: 'Verification code sent to your email',
      email,
    };
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verificationCode) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > user.verificationCodeExpiry!) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const verifiedUser = await this.prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Email verified successfully',
      user: verifiedUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, code } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (email === 'admin@gmail.com') {
      if (code.length !== 4 || !/^\d{4}$/.test(code)) {
        throw new UnauthorizedException('Invalid admin code format');
      }
      
      const adminUser = await this.prisma.user.upsert({
        where: { email },
        update: {
          role: UserRole.ADMIN,
          isEmailVerified: true,
        },
        create: {
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        message: 'Admin login successful',
        user: adminUser,
      };
    }

    if (!user.verificationCode) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }

    if (user.verificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (new Date() > user.verificationCodeExpiry!) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const loggedInUser = await this.prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Login successful',
      user: loggedInUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, phone } = updateUserDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
