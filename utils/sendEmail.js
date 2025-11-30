import sgMail from "@sendgrid/mail";

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_MAIL;

if (SENDGRID_KEY) {
  try {
    sgMail.setApiKey(SENDGRID_KEY);
  } catch (err) {
    console.warn("Failed to initialize SendGrid client:", err?.message || err);
  }
} else {
  console.warn("SENDGRID_API_KEY is not set — email sending will be disabled.");
}

export const sendEmail = async (options) => {
  if (!SENDGRID_KEY || !SENDGRID_FROM) {
    console.warn("Skipping email — SendGrid not configured.", options?.email);
    return;
  }

  const message = {
    to: options.email,
    from: SENDGRID_FROM,
    templateId: options.templateId,
    dynamic_template_data: options.data,
  };

  try {
    await sgMail.send(message);
    console.log("Email sent to", options.email);
  } catch (error) {
    console.error("SendGrid error:", error?.message || error);
    // rethrow so callers that expect a failure can handle it
    throw error;
  }
};
