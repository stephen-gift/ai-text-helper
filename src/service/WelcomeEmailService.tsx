"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: true,

  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Sends both welcome email to user and notification to sender
 * @param {Object} user - User object containing name and email
 * @returns {Promise<Object>} - Result of the email sending operations
 */
export async function sendEmailsWithNotification(user: {
  name: string;
  email: string;
}) {
  if (!user || !user.email) {
    throw new Error("User email is required");
  }

  try {
    // Send welcome email to user
    const welcomeResult = await sendWelcomeEmail(user);

    // Send notification to sender
    const notificationResult = await sendSenderNotification(user);

    console.log(notificationResult);
    return {
      success: true,
      welcomeMessageId: welcomeResult.messageId,
      notificationMessageId: notificationResult.messageId
    };
  } catch (error) {
    console.error("Failed to send emails:", error);
    throw error;
  }
}

/**
 * Sends a welcome email to a newly registered user
 * @param {Object} user - User object containing name and email
 * @returns {Promise<Object>} - Result of the email sending operation
 */
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  if (!user || !user.email) {
    throw new Error("User email is required");
  }

  const { name, email } = user;

  const htmlContent = getWelcomeEmailTemplate(name);

  const textContent = `
    Welcome to Stephen AI Text Helper, ${name}!
    
    Thank you for joining our community. Stephen AI Text Helper empowers you with advanced AI tools for translation, language detection, and text summarization.
    
    Getting Started:
    - Translate text across multiple languages
    - Detect languages effortlessly
    - Summarize long content into concise insights
    
    If you need any assistance, our support team is always here to help at support@stephen-ai-text-helper.com.
    
    Happy building!
    The Stephen AI Text Helper Team
  `;

  try {
    const result = await transporter.sendMail({
      from: `"Stephen AI Text Helper Team" <${
        process.env.EMAIL_FROM || "info@stephengift.com"
      }>`,
      to: email,
      subject: "Welcome to Stephen AI Text Helper! 🚀",
      text: textContent,
      html: htmlContent,
      messageId: `<${Date.now()}@stephen-ai-text-helper.com>`,
      envelope: {
        from: process.env.EMAIL_USER,
        to: email
      },
      headers: {
        "X-Sent-By": "Stephen AI Text Helper"
      }
    });

    console.log("Email sent successfully:", result);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);

    throw error;
  }
}

/**
 * Sends notification email to sender with user details
 * @param {Object} user - User object containing name and email
 * @returns {Promise<Object>} - Result of the email sending operation
 */
async function sendSenderNotification(user: { name: string; email: string }) {
  //   const { name, email } = user;
  const htmlContent = getSenderNotificationTemplate(user);
  const textContent = getSenderNotificationText(user);

  const result = await transporter.sendMail({
    from: `"Stephen AI Text Helper System" <${
      process.env.EMAIL_FROM || "info@stephengift.com"
    }>`,
    to: process.env.EMAIL_USER || "info@stephengift.com",
    subject: "New User Registration Notification",
    text: textContent,
    html: htmlContent,
    messageId: `<${Date.now()}@stephen-ai-text-helper.com>`,
    envelope: {
      from: process.env.EMAIL_USER, // use the authenticated user's email
      to: process.env.EMAIL_USER
    },
    headers: {
      "X-Sent-By": "Stephen AI Text Helper"
    }
  });

  console.log("Sender notification sent successfully:", result);
  return { success: true, messageId: result.messageId };
}

function getSenderNotificationText(user: { name: string; email: string }) {
  return `
    New User Registration Notification

    A new user has registered for Stephen AI Text Helper:

    User Details:
    - Name: ${user.name}
    - Email: ${user.email}
    - Registration Date: ${new Date().toLocaleString()}

    This is an automated notification. Please do not reply to this email.
  `;
}

function getSenderNotificationTemplate(user: { name: string; email: string }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New User Registration Notification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4338ca;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e2e8f0;
        }
        .user-details {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #718096;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New User Registration</h1>
        </div>
        <div class="content">
          <p>A new user has registered for Stephen AI Text Helper.</p>
          
          <div class="user-details">
            <h2>User Details</h2>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 Stephen AI Text Helper. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates the HTML template for the welcome email
 * @param {string} name - The user's name
 * @returns {string} - HTML content for the email
 */
function getWelcomeEmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Stephen AI Text Helper</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #4338ca;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e2e8f0;
          border-top: none;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #718096;
        }
        .button {
          display: inline-block;
          background-color: #4338ca;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .feature {
          margin: 20px 0;
          display: flex;
          align-items: flex-start;
        }
        .feature-icon {
          background-color: #ebf4ff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        .feature-content {
          flex: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://stephen-ai-text-helper.vercel.app/images/Logo.svg" alt="Stephen AI Logo" width="150" style="margin-bottom: 10px;">
          <p>Your AI-Powered Text Assistant</p>
        </div>
        <div class="content">
          <h1>Welcome to Stephen AI Text Helper, ${name}!</h1>
          <p>We're thrilled to have you join our community. Stephen AI Text Helper is designed to make your text-related tasks easier, faster, and more efficient.</p>
          
          <a href="https://stephen-ai-text-helper.vercel.app" class="button">Go to Your Dashboard</a>
          
          <h2>Here's what you can do:</h2>
          
          <div class="feature">
            <div class="feature-icon">🌐</div>
            <div class="feature-content">
              <h3>Translate Text</h3>
              <p>Easily translate text across multiple languages with high accuracy.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🔍</div>
            <div class="feature-content">
              <h3>Detect Languages</h3>
              <p>Automatically detect the language of any text with our advanced AI models.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📝</div>
            <div class="feature-content">
              <h3>Summarize Content</h3>
              <p>Generate concise summaries of long text documents in seconds.</p>
            </div>
          </div>
          
          <p>If you need any assistance, our support team is always here to help at <a href="mailto:info@stephengift.com">info@stephengift.com</a>.</p>
          
          <p>Happy building!</p>
          <p>The Stephen AI Text Helper Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Stephen AI Text Helper. All rights reserved.</p>
          <p>
            <a href="https://stephen-ai-text-helper.vercel.app">Privacy Policy</a> | 
            <a href="https://stephen-ai-text-helper.vercel.app">Terms of Service</a>
          </p>
          
        </div>
      </div>
    </body>
    </html>
  `;
}
