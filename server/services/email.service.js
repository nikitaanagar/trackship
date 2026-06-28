const nodemailer = require('nodemailer');

const isMock = !process.env.EMAIL_USER || 
               process.env.EMAIL_USER.startsWith('mock') || 
               !process.env.EMAIL_PASS || 
               process.env.EMAIL_PASS.startsWith('mock');

let transporter;

if (!isMock) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (isMock) {
    console.log('\n=================== MOCK EMAIL OUTBOX ===================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Text): ${text || 'N/A'}`);
    console.log(`Body (HTML Snippet): ${html ? html.substring(0, 300) + '...' : 'N/A'}`);
    console.log('=========================================================\n');
    return { mock: true, messageId: 'mock-id-' + Math.random().toString(36).substring(7) };
  }

  try {
    const info = await transporter.sendMail({
      from: `"TrackShip Courier" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

// Ready-made HTML templates
const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">TrackShip Verification</h2>
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">Thank you for registering with TrackShip. Please verify your email using the following One-Time Password (OTP):</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 6px; background-color: #f8fafc; padding: 12px 24px; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 TrackShip Inc. All rights reserved.</p>
    </div>
  `;
  return await sendEmail({
    to: email,
    subject: 'Verify your TrackShip Account',
    html,
    text: `Your TrackShip OTP is ${otp}. Valid for 10 minutes.`
  });
};

const sendBookingConfirmedEmail = async (email, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Booking Confirmed!</h2>
      <p style="font-size: 16px; color: #334155;">Hi ${booking.recipient.name || 'Recipient'},</p>
      <p style="font-size: 16px; color: #334155;">A parcel shipment has been booked for you. Here are the booking details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">Tracking ID</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #2563eb;">${booking.trackingId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">Category</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.parcel.category}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">Weight</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${booking.parcel.weight} kg</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0; color: #0f172a;">Amount</th>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">₹${booking.payment.amount} (${booking.payment.method.toUpperCase()})</td>
        </tr>
      </table>

      ${booking.qrCode ? `
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 14px; font-weight: bold; color: #334155;">QR Code for Pickup/Delivery Scanning:</p>
        <img src="${booking.qrCode}" alt="Booking QR Code" style="width: 180px; height: 180px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px;" />
      </div>
      ` : ''}

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 TrackShip Inc. All rights reserved.</p>
    </div>
  `;
  return await sendEmail({
    to: email,
    subject: `TrackShip Booking Confirmed: ${booking.trackingId}`,
    html,
    text: `Your TrackShip parcel booking is confirmed. Tracking ID: ${booking.trackingId}. Estimated Delivery: 3-5 days.`
  });
};

const sendStatusUpdateEmail = async (email, booking, subjectText, statusText) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Shipment Status Update</h2>
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">Your shipment <strong>${booking.trackingId}</strong> has reached a new stage:</p>
      
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #1e3a8a; font-size: 18px;">Status: ${statusText}</strong>
      </div>

      <p style="font-size: 14px; color: #475569;">You can track this shipment live on our portal using the tracking ID.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 TrackShip Inc. All rights reserved.</p>
    </div>
  `;
  return await sendEmail({
    to: email,
    subject: `TrackShip Status Update: ${booking.trackingId} is ${subjectText}`,
    html,
    text: `Your TrackShip shipment ${booking.trackingId} status has updated to: ${statusText}.`
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendBookingConfirmedEmail,
  sendStatusUpdateEmail
};
