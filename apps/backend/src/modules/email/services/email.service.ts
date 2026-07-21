import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendLawyerAssignmentEmail(
    to: string,
    lawyerName: string,
    assignmentType: 'client' | 'case',
    details: {
      name?: string;
      number?: string;
      title?: string;
      reason?: string;
      isPrimary?: boolean;
      role?: string;
    },
  ) {
    const subject = assignmentType === 'client' 
      ? 'Yeni Müvekkil Ataması' 
      : 'Yeni Dava Ataması';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${lawyerName},</h2>
            <p>Sizin için yeni bir atama yapıldı:</p>
            
            <div class="details">
              ${assignmentType === 'client' ? `
                <h3>Müvekkil Bilgileri</h3>
                <p><strong>Ad:</strong> ${details.name}</p>
                ${details.isPrimary ? '<p><strong>Durum:</strong> Ana Avukat</p>' : ''}
              ` : `
                <h3>Dava Bilgileri</h3>
                <p><strong>Dava No:</strong> ${details.number}</p>
                <p><strong>Konu:</strong> ${details.title}</p>
                ${details.role ? `<p><strong>Rol:</strong> ${details.role}</p>` : ''}
                ${details.isPrimary ? '<p><strong>Durum:</strong> Ana Avukat</p>' : ''}
              `}
              ${details.reason ? `<p><strong>Gerekçe:</strong> ${details.reason}</p>` : ''}
            </div>
            
            <p>Detayları görmek için sisteme giriş yapabilirsiniz.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Sisteme Git</a>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
            <p>&copy; ${new Date().getFullYear()} LexMind AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"LexMind AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  async sendLawyerRemovalEmail(
    to: string,
    lawyerName: string,
    assignmentType: 'client' | 'case',
    details: {
      name?: string;
      number?: string;
      title?: string;
      reason?: string;
    },
  ) {
    const subject = assignmentType === 'client' 
      ? 'Müvekkil Ataması Kaldırıldı' 
      : 'Dava Ataması Kaldırıldı';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${lawyerName},</h2>
            <p>Aşağıdaki atamanız kaldırıldı:</p>
            
            <div class="details">
              ${assignmentType === 'client' ? `
                <h3>Müvekkil Bilgileri</h3>
                <p><strong>Ad:</strong> ${details.name}</p>
              ` : `
                <h3>Dava Bilgileri</h3>
                <p><strong>Dava No:</strong> ${details.number}</p>
                <p><strong>Konu:</strong> ${details.title}</p>
              `}
              ${details.reason ? `<p><strong>Gerekçe:</strong> ${details.reason}</p>` : ''}
            </div>
            
            <p>Herhangi bir sorunuz varsa yöneticinizle iletişime geçebilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
            <p>&copy; ${new Date().getFullYear()} LexMind AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"LexMind AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}
