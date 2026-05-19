import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // Sửa lại đúng tên biến môi trường trong file .env của bạn
        user: process.env.SEND_MAIL_EMAIL, 
        pass: process.env.SEND_MAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: `"Studio Makeup" <${process.env.SEND_MAIL_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Gửi mail thành công đến: ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email Error] Thất bại:", error);
    return false;
  }
};