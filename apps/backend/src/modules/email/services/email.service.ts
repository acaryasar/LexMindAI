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

  async sendUserRegistrationEmail(
    to: string,
    firstName: string,
    lastName: string,
  ) {
    const subject = 'LexMind AI Hesabınız Oluşturuldu';
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

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
          .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin-bottom: 15px; padding-left: 20px; position: relative; }
          .step:before { content: "✓"; position: absolute; left: 0; color: #1e40af; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Hoş Geldiniz ${firstName} ${lastName},</h2>
            <p>LexMind AI sistemine kaydınız başarıyla oluşturuldu. Sisteme giriş yapmak için aşağıdaki adımları izleyiniz:</p>
            
            <div class="steps">
              <div class="step">
                <strong>1. Adım:</strong> Giriş sayfasına gidin
              </div>
              <div class="step">
                <strong>2. Adım:</strong> E-posta adresinizi girin
              </div>
              <div class="step">
                <strong>3. Adım:</strong> "Şifremi Unuttum" linkine tıklayın
              </div>
              <div class="step">
                <strong>4. Adım:</strong> E-posta adresinizi girin ve şifre sıfırlama bağlantısını alın
              </div>
              <div class="step">
                <strong>5. Adım:</strong> Bağlantıya tıklayarak kendinize güvenli bir şifre belirleyin
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Önemli Güvenlik Uyarısı:</strong>
              <p>Sistemimiz güvenlik nedeniyle şifrelerinizi e-posta ile göndermez. Lütfen "Şifremi Unuttum" özelliğini kullanarak kendi şifrenizi belirleyiniz.</p>
            </div>
            
            <a href="${loginUrl}/auth/login" class="button">Giriş Sayfasına Git</a>
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

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    lastName: string,
    resetToken: string,
  ) {
    const subject = 'Şifre Sıfırlama Bağlantısı';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

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
          .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${firstName} ${lastName},</h2>
            <p>Şifrenizi sıfırlamak için bir talebiniz aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
            
            <div class="info">
              <p><strong>⚠️ Önemli:</strong> Bu bağlantı 1 saat süreyle geçerlidir.</p>
            </div>
            
            <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            
            <div class="warning">
              <strong>Güvenlik Uyarısı:</strong>
              <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden geliniz. Şifreniz değişmeyecektir.</p>
            </div>
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

  async sendPasswordChangeNotificationEmail(
    to: string,
    firstName: string,
    lastName: string,
  ) {
    const subject = 'Şifreniz Değiştirildi';
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${firstName} ${lastName},</h2>
            <p>LexMind AI hesabınızın şifresi başarıyla değiştirildi.</p>
            
            <div class="info">
              <p><strong>Değişiklik Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p><strong>İşlem:</strong> Şifre güncelleme</p>
            </div>

            <div class="warning">
              <strong>⚠️ Güvenlik Bilgisi:</strong>
              <p>Bu işlemi siz yapmadıysanız, hesabınızın güvenliği için lütfen derhal yöneticinizle iletişime geçiniz.</p>
            </div>
            
            <a href="${loginUrl}/auth/login" class="button">Giriş Yap</a>
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

  async sendCalendarEventInvitationEmail(
    to: string,
    recipientName: string,
    eventDetails: {
      title: string;
      date: string;
      time?: string;
      location?: string;
      type: string;
      notes?: string;
      caseNumber?: string;
    },
    creatorName: string,
  ) {
    const subject = 'Yeni Takvim Etkinliği Daveti';
    const calendarUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar`;

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
          .info { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0284c7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LexMind AI</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${recipientName},</h2>
            <p>Sizi yeni bir takvim etkinliğine davet ediyoruz:</p>
            
            <div class="details">
              <h3>${eventDetails.title}</h3>
              <p><strong>Tür:</strong> ${this.getEventTypeLabel(eventDetails.type)}</p>
              <p><strong>Tarih:</strong> ${new Date(eventDetails.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              ${eventDetails.time ? `<p><strong>Saat:</strong> ${eventDetails.time}</p>` : ''}
              ${eventDetails.location ? `<p><strong>Konum:</strong> ${eventDetails.location}</p>` : ''}
              ${eventDetails.caseNumber ? `<p><strong>Dava No:</strong> ${eventDetails.caseNumber}</p>` : ''}
              ${eventDetails.notes ? `<p><strong>Notlar:</strong> ${eventDetails.notes}</p>` : ''}
              <p><strong>Oluşturan:</strong> ${creatorName}</p>
            </div>
            
            <div class="info">
              <p><strong>ℹ️ Bilgi:</strong> Bu etkinlik takviminizde görünecektir. Detayları görmek için sisteme giriş yapabilirsiniz.</p>
            </div>
            
            <a href="${calendarUrl}" class="button">Takvime Git</a>
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

  private getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      HEARING: 'Duruşma',
      MEETING: 'Toplantı',
      DEADLINE: 'Son Tarih',
      REMINDER: 'Hatırlatma',
      CLIENT_MEETING: 'Müvekkil Görüşmesi',
      DOCUMENT_REVIEW: 'Belge İncelemesi',
      INTERNAL_MEETING: 'İç Toplantı',
      PHONE_CALL: 'Telefon Görüşmesi',
      VIDEO_CALL: 'Video Görüşme',
      OTHER: 'Diğer',
    };
    return labels[type] || type;
  }
}
