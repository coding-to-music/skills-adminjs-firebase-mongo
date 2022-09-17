const nodemailer = require("nodemailer");
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

const sendMail = ({ name, email, subject, html }) => {
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
};

module.exports = {
	sendMail,
};
