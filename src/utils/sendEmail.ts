import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, html: string, subject: string) => {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log('.../', testAccount);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'a7n73nzvd3aozbne@ethereal.email',
      pass: '4HK92Yj2T39zCE6ndM',
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
