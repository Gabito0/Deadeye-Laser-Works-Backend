const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// function sendConfirmationEmail(secretKey, username, from, to, next) {
//   jwt.sign(
//     {
//       user: username,
//     },
//     secretKey,
//     {
//       expiresIn: "1d",
//     },
//     (err, emailToken) => {
//       if (err) {
//         return next(err);
//       }
//       const url = `http://localhost:3001/auth/confirmation/${emailToken}`;

//       transporter.sendMail({
//         from: from,
//         to: to,
//         subject: "Confirmation Email",
//         html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
//       });
//     }
//   );
// }

function sendConfirmationEmail(secretKey, username, from, to, next) {
  jwt.sign(
    {
      user: username,
    },
    secretKey,
    {
      expiresIn: "1d",
    },
    (err, emailToken) => {
      if (err) {
        return next(err);
      }

      const url =
        process.env.VERIFICATION_URL ||
        `http://localhost:5173/email-verification/${emailToken}`;

      transporter.sendMail(
        {
          from: from,
          to: to,
          subject: "Confirmation Email",
          html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
        },
        (error, info) => {
          if (error) {
            return next(error);
          }
          return res.json({ success: true });
        }
      );
    }
  );
}

module.exports = sendConfirmationEmail;

module.exports = {
  sendConfirmationEmail,
};
