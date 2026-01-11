import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Zen Store <noreply@resend.dev>', // Use your verified domain
        to: [email],
        subject: 'Your Zen Store Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Zen Store</h1>
              <p style="color: #6B7280; margin: 5px 0;">Your trusted bamboo products store</p>
            </div>
            
            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 30px; text-align: center;">
              <h2 style="color: #1F2937; margin-bottom: 20px;">Verification Code</h2>
              
              <div style="background-color: white; border: 2px dashed #D1D5DB; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h1 style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; margin: 0;">${code}</h1>
              </div>
              
              <p style="color: #6B7280; margin: 20px 0;">
                Enter this 4-digit code to complete your verification.
              </p>
              
              <p style="color: #EF4444; font-size: 14px; margin-top: 20px;">
                ⚠️ This code will expire in 10 minutes
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>© 2026 Zen Store. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification email');
      }

      console.log('Email sent successfully:', data);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}