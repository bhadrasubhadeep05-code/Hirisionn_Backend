const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

async function sendEmail({ to, subject, html, text, from }) {
  const mailOptions = {
    from: from || `"Hirisionn" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail, transporter };