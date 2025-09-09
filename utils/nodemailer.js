// import nodemailer from "nodemailer";

// // Configure transport
//  export const transporter = nodemailer.createTransport({
//   service: "gmail", // Use your email service, e.g., Gmail, Outlook
//   auth: {
//     user: "anonymous52839626@gmail.com", // Replace with your email
//     pass: "qyeqegnyLrrabdiy", // Replace with your email password or app password
//   },
// });

// // Verify connection configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Error connecting to email server:", error);
//   } else {
//     console.log("Email server is ready to send messages.");
//   }
// });


// import nodemailer from "nodemailer";
// import { google } from "googleapis";

// // OAuth2 setup
// const CLIENT_ID = "YOUR_CLIENT_ID";
// const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN = "YOUR_REFRESH_TOKEN";

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function sendMail() {
//   try {
//     // Get access token
//     const accessToken = await oAuth2Client.getAccessToken();

//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "anonymous52839626@gmail.com",
//         clientId:"297990304358-jum3if3h9nl963c11m3m39difdvu50v9.apps.googleusercontent.com" ,
//         clientSecret: "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",
//         refreshToken: "1//04uFGH20cwBcNCgYIARAAGAQSNwF-L9IrDaqvzX1e7Vza26YNujaEx3pM4_wyPF30r2nJycMXj4gpGpeonOqpSocJPDWkv5X71Gk",
//         accessToken:"ya29.A0AS3H6NxXnRiH2vcFSIb2ouUxEuxWdZHzv5DDWG952XRSK4NvyfwvNjdc92STsHxJ6imQqYiaSMwHHZgyQW-UfBwhE3-J9EXbB5ufCj-Y2cv6pMyg6MLgou7WaIg8o3lLbyaOMnSZJGvFMU1kfgvfD9P50-bXjD6UC74zF86FUkG_mogCM1ZFl3PFFHHM05XoaJqIs5oaCgYKAbASARISFQHGX2MiJVcO6-NRUjwcHI2aGavm1A0206",
//       },
//     });

//     // Send email
//     const result = await transporter.sendMail({
//       from: "Your Name <anonymous52839626@gmail.com>",
//       to: "recipient@example.com",
//       subject: "Hello from Gmail OAuth2",
//       text: "This email was sent using Nodemailer with OAuth2!",
//     });

//     console.log("Email sent:", result.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }

// sendMail();

// services/mailer.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

const {
  GMAIL_USER,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_REDIRECT_URI,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

/**
 * Creates a transporter with a fresh access token.
 * Exported so controllers can reuse it.
 */
export async function getTransporter() {
  const { token: accessToken } = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_USER,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN,
      accessToken,
    },
  });
}

/**
 * Convenience helper to send an email directly.
 * You can import and call sendMail(...) from controllers.
 */
export async function sendMail({ to, subject, text, html, from }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: from || `Your App <${GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info; // contains messageId, etc.
}

// import { getTransporter } from "../services/mailer.js";

// const transporter = await getTransporter();
// transporter.verify((error, success) => {
//   if (error) console.error("SMTP verify error:", error);
//   else console.log("SMTP server is ready to send messages.");
// });