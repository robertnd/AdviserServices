import nodemailer, { SentMessageInfo } from "nodemailer"
import path from "path"
import fs from "fs/promises"
import config from "../../../config"
import axios from 'axios'
import logger from "../../../shared/logging/logger"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail_user,
    pass: config.gmail_app_password,
  },
})
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
  )
  let emailTemplate = await fs.readFile(templatePath, "utf8")
  emailTemplate = emailTemplate.replace(
    "{{SET_PASSWORD_LINK}}",
    setPasswordLink
  )

  const sendResult = await transporter.sendMail({
    from: `"OM-adviser" <${config.gmail_user}>`,
    to,
    subject: "Set Your Password",
    html: emailTemplate,
  })

  return sendResult
}

export const sendEmailViaAPI = async (
  to: string,
  setPasswordLink: string
): Promise<any> => {
  const apiUrl = 'http://ec2-13-48-194-80.eu-north-1.compute.amazonaws.com:8090/send-email'
  
  const emailData = {
    from: "athena@quantrica.com",
    to: to,
    body: setPasswordLink
  }

  try {
    const response = await axios.post(apiUrl, emailData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    logger.log('Mail sending response:', response)
    return response.data
  } catch (error) {
    logger.error('Error sending email via API:', error)
    throw error
  }
}
