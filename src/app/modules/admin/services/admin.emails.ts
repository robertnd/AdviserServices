import nodemailer, { SentMessageInfo } from "nodemailer";
import path from "path";
import fs from "fs/promises";
import config from "../../../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail_user,
    pass: config.gmail_app_password,
  },
});
// TODO: make this reusable for other emails
export const sendEmail = async (
  to: string,
  setPasswordLink: string
): Promise<SentMessageInfo> => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "InviteEmail.html"
  );
  let emailTemplate = await fs.readFile(templatePath, "utf8");
  emailTemplate = emailTemplate.replace(
    "{{SET_PASSWORD_LINK}}",
    setPasswordLink
  );

  await transporter.sendMail({
    from: `"OM-adviser" <${config.gmail_user}>`,
    to,
    subject: "Set Your Password",
    html: emailTemplate,
  });
};
