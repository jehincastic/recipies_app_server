import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, html: string, subject: string) => {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log('.../', testAccount);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.email_pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject,
    html,
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
