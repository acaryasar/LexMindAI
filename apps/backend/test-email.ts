import * as nodemailer from 'nodemailer';

// Email configuration from .env.development
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'lexmindai.destek@gmail.com',
    pass: 'hdwk xkwo vcdn lamu',
  },
};

async function sendRegistrationEmail() {
  const transporter = nodemailer.createTransport(emailConfig);
  
  const to = 'acaryasar@gmail.com';
  const firstName = 'Acar';
  const lastName = 'Yasar';
  const loginUrl = 'http://localhost:3000';

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

  try {
    console.log('Kayıt e-postası gönderiliyor...');
    
    await transporter.sendMail({
      from: '"LexMind AI" <lexmindai.destek@gmail.com>',
      to,
      subject: 'LexMind AI Hesabınız Oluşturuldu',
      html,
    });

    console.log('✅ Kayıt e-postası başarıyla gönderildi!');
  } catch (error) {
    console.error('❌ E-posta gönderilemedi:', error);
  }
}

sendRegistrationEmail();
