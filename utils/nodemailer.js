import nodemailer from "nodemailer";

// Configure transport
 export const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service, e.g., Gmail, Outlook
  auth: {
    user: "anonymous52839626@gmail.com", // Replace with your email
    pass: "qyeqegnyLrrabdiy", // Replace with your email password or app password
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages.");
  }
});


