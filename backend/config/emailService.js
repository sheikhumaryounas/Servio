import nodemailer from 'nodemailer';

// Helper function to check if SMTP config is using placeholders
const isPlaceholderConfig = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return !user || !pass || pass === 'your_16_digit_app_password_here';
};

export const sendResetOtpEmail = async (toEmail, otp) => {
  let transporter;
  let fromAddress = process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`;
  let usingEthereal = false;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (isPlaceholderConfig()) {
    usingEthereal = true;
  }

  // Pre-define mail options at the function scope level to prevent ReferenceErrors in the catch block
  const mailOptions = {
    from: '',
    to: toEmail,
    subject: '🔑 Servio - Password Reset OTP Code',
    text: `Your password reset code is: ${otp}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdfdfd;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 32px;">⚡</span>
          <h2 style="color: #22c55e; margin: 5px 0 0 0; font-weight: 800;">Servio</h2>
          <p style="font-size: 12px; color: #888888; margin: 2px 0 0 0;">Real-Time Local Service Concierge</p>
        </div>
        <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
          <p style="font-size: 14px; color: #333333; line-height: 1.5;">Hello,</p>
          <p style="font-size: 14px; color: #333333; line-height: 1.5;">We received a request to reset your password. Please use the following 6-digit OTP code to complete the reset process:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; border: 1px solid #cbd5e1;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #ff3b30; font-weight: bold;">Note: This OTP code is valid for only 10 minutes.</p>
          <p style="font-size: 14px; color: #333333; line-height: 1.5; margin-top: 20px;">If you did not request this reset, you can safely ignore this email.</p>
        </div>
        <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
          &copy; 2026 Servio. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    if (usingEthereal) {
      console.log('⚠️  [emailService] SMTP credentials are not configured in backend/.env.');
      console.log('🔗  Creating Ethereal Mail test account...');
      
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      // Keep original fromAddress so it's sent from servio.support.ltd@gmail.com
    } else {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587');

      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      });
    }

    mailOptions.from = fromAddress;
    const info = await transporter.sendMail(mailOptions);
    let previewUrl = null;

    if (usingEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n==================================================');
      console.log('📧  [emailService] Ethereal email sent successfully!');
      console.log(`🔗  Preview URL: ${previewUrl}`);
      console.log(`🔑  OTP Code: ${otp}`);
      console.log('==================================================\n');
    } else {
      console.log(`[emailService] Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
    }

    return { info, previewUrl, success: true };
  } catch (error) {
    console.log('\n==================================================');
    console.log('⚠️  [emailService] SMTP EMAIL SENDING FAILED!');
    console.log(`Reason: ${error.message}`);
    console.log('--------------------------------------------------');
    console.log(`🔑  DEVELOPMENT OTP CODE FOR TESTING: ${otp}`);
    console.log('==================================================\n');

    // Attempt backup Ethereal Mail if real SMTP failed
    if (!usingEthereal) {
      try {
        console.log('🔗  Attempting fallback to Ethereal Mail...');
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });

        mailOptions.from = fromAddress;
        const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(fallbackInfo);
        
        console.log('\n==================================================');
        console.log('📧  [emailService] Fallback Ethereal email sent successfully!');
        console.log(`🔗  Preview URL: ${previewUrl}`);
        console.log(`🔑  OTP Code: ${otp}`);
        console.log('==================================================\n');

        return { info: fallbackInfo, previewUrl, success: true };
      } catch (fallbackError) {
        console.error('❌  [emailService] Fallback Ethereal sending failed too:', fallbackError.message);
      }
    }

    return { success: false, error: error.message };
  }
};


