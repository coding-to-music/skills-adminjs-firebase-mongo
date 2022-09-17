const nodemailer = require("nodemailer");
const ejs = require("ejs");
const config = require("../../config/config");

const sender = nodemailer.createTransport({
  service: "gmail",
  secureConnection: true,
  logger: true,
  auth: {
    user: config.nodemailer.email,
    pass: config.nodemailer.password,
  },
});

const sendMail = ({ email, subject, data }) => {
  ejs.renderFile(
    `${__dirname}/mailTemplate.ejs`,
    {
      ...data,
    },
    (err, html) => {
      if (err) {
        console.log(err);
      } else {
        const mail = {
          from: `Zairza <${config.nodemailer.email}`,
          to: email,
          subject: subject,
          html: `${html}`,
        };

        sender.sendMail(mail, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent successfully: " + info.response);
          }
        });
      }
    }
  );
};

module.exports = {
  sendMail,
};
