const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    requireTLS: Number(process.env.EMAIL_PORT) !== 465, // enforce STARTTLS on port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 10000,     // 10s for socket inactivity
    tls: {
      rejectUnauthorized: false, // allow self-signed certs (some hosts need this)
    },
  });

  const mailOptions = {
    from: '"ShopEase" <support@easeshopping.tech>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Safety-net timeout: reject if sendMail hangs for more than 15 seconds
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email send timed out after 15 seconds")), 15000)
  );

  await Promise.race([transporter.sendMail(mailOptions), timeout]);
};

module.exports = sendEmail;
