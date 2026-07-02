import nodemailer from 'nodemailer';

// Helper function to create Nodemailer transporter using credentials from .env
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass === 'your_16_digit_app_password_here') {
    throw new Error('SMTP_USER or SMTP_PASS is missing or using the placeholder in backend/.env');
  }

  // Real SMTP Transporter
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 or other ports
    auth: {
      user,
      pass
    }
  });
};

export const sendResetOtpEmail = async (toEmail, otp) => {
  try {
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`;

    const mailOptions = {
      from: fromAddress,
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);

    return { info, previewUrl: null, success: true };
  } catch (error) {
    console.log('\n==================================================');
    console.log('⚠️  [emailService] SMTP EMAIL SENDING FAILED!');
    console.log(`Reason: ${error.message}`);
    console.log('--------------------------------------------------');
    console.log(`🔑 DEVELOPMENT OTP CODE FOR TESTING: ${otp}`);
    console.log('==================================================\n');

    return { success: false, error: error.message };
  }
};
