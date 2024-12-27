import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { EmailEnum } from '@/constants/email.enum';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(
  to: string,
  type: EmailEnum,
  content: Record<string, any>,
) {
  const subjects = {
    [EmailEnum.VERIFY_ACCOUNT]: 'Verify Your Email Account',
    [EmailEnum.RESET_PASSWORD]: 'Reset Password',
  };

  const templatePaths = {
    [EmailEnum.VERIFY_ACCOUNT]: path.join(
      __dirname,
      '../templates/',
      'email-templates',
      `${EmailEnum.VERIFY_ACCOUNT}.html`,
    ),
    [EmailEnum.RESET_PASSWORD]: path.join(
      __dirname,
      '../templates/',
      'email-templates',
      `${EmailEnum.RESET_PASSWORD}.html`,
    ),
  };

  const subject = subjects[type];
  const templatePath = templatePaths[type];

  if (!subject || !templatePath) {
    throw new Error('Unknown email type');
  }

  const htmlContent: string = await renderTemplate(templatePath, {
    ...content,
    baseUrl: process.env.SERVER_URL,
  });

  const mailOptions = {
    from: 'Shoes Shop',
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

const renderTemplate = async (
  templatePath: string,
  data: Record<string, any>,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html as string);
      }
    });
  });
};
