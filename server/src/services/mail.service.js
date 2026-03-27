const transporter = require("../config/mailer");

const sendResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"VoxCampus" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `<p>Click the link below to reset your password. It expires in 1 hour.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });
};

const sendEscalationEmail = async (to, post) => {
  await transporter.sendMail({
    from: `"VoxCampus" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[Escalated] ${post.title}`,
    html: `<p>The following post has been escalated due to inactivity:</p>
           <h3>${post.title}</h3>
           <p>${post.body}</p>
           <p>Status: ${post.status}</p>
           <p>Submitted: ${post.createdAt}</p>`,
  });
};

module.exports = { sendResetEmail, sendEscalationEmail };
