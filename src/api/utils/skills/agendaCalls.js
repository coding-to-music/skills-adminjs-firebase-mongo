const config = require('../../../config/agenda');
const DomainRegistrations = require('../../models/skills/domainRegistration.model');

const submitTask = async (agenda) => {
  DomainRegistrations.find({})
	.populate("users")
	.populate("domain")
	.exec(async function (err, results) {
	  if (err) {
		throw err;
	  }
	  for(let i = 0; i < results.length; i++) {
		if (results[i].user.name === undefined) {
		  results[i].user.name = "";
		}
		await agenda.schedule(config.weekStart, "submit task", { user: results[i].user });
	  }
  })
}
