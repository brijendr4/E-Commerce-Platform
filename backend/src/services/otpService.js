import nodemailer from 'nodemailer'

/**
 * Generate a random 6-digit numeric OTP
 * @returns {string}
 */
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP verification email to the user
 * @param {string} email 
 * @param {string} otp 
 */
export async function sendOtpEmail(email, otp) {
  // If credentials are not set, fallback to console logging
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n----------------------------------------------------')
    console.log(`✉️  [MOCK EMAIL] OTP for ${email} is: ${otp}`)
    console.log('To send real emails, set SMTP_USER and SMTP_PASS in backend/.env')
    console.log('----------------------------------------------------')
    return { mock: true, otp }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const mailOptions = {
    from: `"Fashion & Freedom" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'OTP for password change - Fashion & Freedom',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #1e293b; font-family: monospace;">FASHION & FREEDOM</span>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Password Change Verification</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">You are receiving this email because you requested a password change for your account. Please use the following One-Time Password (OTP) to complete the verification process. This code is valid for 10 minutes.</p>
          
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${otp}
          </div>
          
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">If you did not request a password change, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This is an automated security notification. Please do not reply directly to this email.</p>
      </div>
    `
  }

  return transporter.sendMail(mailOptions)
}
