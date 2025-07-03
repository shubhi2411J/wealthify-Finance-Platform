const { Resend } = require("resend");
const dotenv = require("dotenv");
const { render } = require("@react-email/render");
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY || "");

const sendEmail = async ({ to, subject, react }) => {
  try {
    const data = await resend.emails.send({
      from: "Finance app <onboarding@resend.dev>",
      to,
      subject,
      html: "", // JSX email
    });

    return { success: true, data };
  } catch (error) {
    console.error(" Error in sendEmail:", error);
    return { success: false, error: error.message };
  }
};
module.exports = { sendEmail };
