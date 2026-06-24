import nodemailer from "nodemailer";

const sendEmail = async (
  to,
  subject,
  text
) => {
  const emailUser = process.env.EMAIL_USER;
  const isGmail = process.env.EMAIL_SERVICE === "gmail" || 
                  (emailUser && emailUser.endsWith("@gmail.com"));

  const config = {
    auth: {
      user: emailUser,
      pass: process.env.EMAIL_PASS,
    },
  };

  if (isGmail) {
    config.service = "gmail";
  } else {
    config.host = process.env.EMAIL_HOST || "smtp.ethereal.email";
    config.port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    config.secure = process.env.EMAIL_SECURE === "true"; // false for port 587, true for 465
  }

  const transporter = nodemailer.createTransport(config);

  await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
  });
};

export default sendEmail;