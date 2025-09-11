// backend/src/utils/mailer.js
const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html, cc }) {
  const t = getTransporter();
  const opts = {
    from: `"Seguimiento Actividades" <${SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html,
  };
  if (cc && cc.length) opts.cc = cc.join(',');
  return t.sendMail(opts);
}

module.exports = { sendEmail };
