import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendDownloadLinkEmail = async (email, filename, downloadLink) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your download link for ${filename}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">File Sharing Service</h2>
          <p>Your file <strong>${filename}</strong> has been uploaded successfully.</p>
          <p>You can download it using the link below:</p>
          <p><a href="${downloadLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download File</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this file, please ignore this email.</p>
          <hr>
          <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendDownloadLinkEmail
};