import nodemailer from 'nodemailer';

// Helper function to check if SMTP config is using real credentials
const isPlaceholderConfig = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return !user || !pass || pass === 'your_16_digit_app_password_here';
};

// Wrap any promise with a timeout — prevents email from hanging indefinitely
const withTimeout = (promise, ms = 8000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Email operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

// Send OTP via real Gmail SMTP (when configured)
const sendViaGmail = async (mailOptions) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const info = await withTimeout(transporter.sendMail(mailOptions), 10000);
  return { success: true, info, previewUrl: null };
};

// Send OTP via Ethereal for local development when SMTP is not configured
const sendViaEthereal = async (mailOptions) => {
  const testAccount = await withTimeout(nodemailer.createTestAccount(), 10000);
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  const info = await withTimeout(transporter.sendMail(mailOptions), 10000);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { success: true, info, previewUrl };
};

// ============================================================
// SHARED: Log OTP to console as fallback (no network needed)
// ============================================================
const logOtpToConsole = (otp, type = 'OTP') => {
  console.log('\n==================================================');
  console.log(`📧  [emailService] Email sending skipped (no SMTP configured).`);
  console.log(`🔑  ${type}: ${otp}`);
  console.log(`    Copy this OTP from your server terminal to proceed.`);
  console.log('==================================================\n');
};

// ============================================================
export const sendRegistrationOtpEmail = async (toEmail, otp) => {
  // If real SMTP is configured, use it
  if (!isPlaceholderConfig()) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`,
        to: toEmail,
        subject: '🔑 Servio - Account Verification OTP Code',
        text: `Your account verification code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdfdfd;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">⚡</span>
              <h2 style="color: #22c55e; margin: 5px 0 0 0; font-weight: 800;">Servio</h2>
              <p style="font-size: 12px; color: #888888; margin: 2px 0 0 0;">Real-Time Local Service Concierge</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 14px; color: #333333;">Hello,</p>
              <p style="font-size: 14px; color: #333333;">Thank you for registering with Servio! Use the following OTP to verify your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 28px; font-weight: bold; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; border: 1px solid #cbd5e1;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #ff3b30; font-weight: bold;">Note: This OTP code is valid for only 10 minutes.</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
              &copy; 2026 Servio. All rights reserved.
            </div>
          </div>
        `
      };
      return await sendViaGmail(mailOptions);
    } catch (err) {
      console.error(`[emailService] Gmail SMTP failed: ${err.message}`);
      logOtpToConsole(otp, 'SIGNUP OTP');
      return { success: false, error: err.message, previewUrl: null };
    }
  }

  // No real SMTP — use Ethereal to generate a preview link for local testing
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`,
      to: toEmail,
      subject: '🔑 Servio - Account Verification OTP Code',
      text: `Your account verification code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdfdfd;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">⚡</span>
              <h2 style="color: #22c55e; margin: 5px 0 0 0; font-weight: 800;">Servio</h2>
              <p style="font-size: 12px; color: #888888; margin: 2px 0 0 0;">Real-Time Local Service Concierge</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 14px; color: #333333;">Hello,</p>
              <p style="font-size: 14px; color: #333333;">Thank you for registering with Servio! Use the following OTP to verify your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 28px; font-weight: bold; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; border: 1px solid #cbd5e1;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #ff3b30; font-weight: bold;">Note: This OTP code is valid for only 10 minutes.</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
              &copy; 2026 Servio. All rights reserved.
            </div>
          </div>
        `
    };

    const result = await sendViaEthereal(mailOptions);
    return { success: true, previewUrl: result.previewUrl };
  } catch (err) {
    logOtpToConsole(otp, 'SIGNUP OTP');
    return { success: false, error: err.message, previewUrl: null };
  }
};

// ============================================================
export const sendResetOtpEmail = async (toEmail, otp) => {
  // If real SMTP is configured, use it
  if (!isPlaceholderConfig()) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`,
        to: toEmail,
        subject: '🔑 Servio - Password Reset OTP Code',
        text: `Your password reset code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdfdfd;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">⚡</span>
              <h2 style="color: #22c55e; margin: 5px 0 0 0; font-weight: 800;">Servio</h2>
            </div>
            <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 14px; color: #333333;">We received a request to reset your password. Use this OTP:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 28px; font-weight: bold; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; border: 1px solid #cbd5e1;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #ff3b30; font-weight: bold;">Note: This OTP code is valid for only 10 minutes.</p>
              <p style="font-size: 14px; color: #333333;">If you did not request this reset, you can safely ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
              &copy; 2026 Servio. All rights reserved.
            </div>
          </div>
        `
      };
      return await sendViaGmail(mailOptions);
    } catch (err) {
      console.error(`[emailService] Gmail SMTP failed: ${err.message}`);
      logOtpToConsole(otp, 'RESET OTP');
      return { success: false, error: err.message, previewUrl: null };
    }
  }

  // No real SMTP — use Ethereal to generate a preview link for local testing
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Servio" <servio.support.ltd@gmail.com>`,
      to: toEmail,
      subject: '🔑 Servio - Password Reset OTP Code',
      text: `Your password reset code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdfdfd;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 32px;">⚡</span>
              <h2 style="color: #22c55e; margin: 5px 0 0 0; font-weight: 800;">Servio</h2>
            </div>
            <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
              <p style="font-size: 14px; color: #333333;">We received a request to reset your password. Use this OTP:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 28px; font-weight: bold; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; border: 1px solid #cbd5e1;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #ff3b30; font-weight: bold;">Note: This OTP code is valid for only 10 minutes.</p>
              <p style="font-size: 14px; color: #333333;">If you did not request this reset, you can safely ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
              &copy; 2026 Servio. All rights reserved.
            </div>
          </div>
        `
    };

    const result = await sendViaEthereal(mailOptions);
    return { success: true, previewUrl: result.previewUrl };
  } catch (err) {
    logOtpToConsole(otp, 'RESET OTP');
    return { success: false, error: err.message, previewUrl: null };
  }
};
