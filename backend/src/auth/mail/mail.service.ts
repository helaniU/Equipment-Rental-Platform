import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Instead of SMTP, log it clearly in your backend terminal console
    console.log('\n========================================');
    console.log(`[DEV MODE] Password Reset Link for: ${email}`);
    console.log(`👉 ${resetUrl}`);
    console.log('========================================\n');
  }
}