const Agenda = require("agenda");
const DomainRegistrations = require("../models/skills/domains.model");
const Users = require("../models/user.model");

const agenda = Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: "agendaJobs",
  },
});

agenda.define("submit task", async function (job, done) {
  DomainRegistrations.find({})
    .populate("user")
    .populate("domain")
    .exec(function (err, results) {
      if (err) {
        throw err;
      }
      for (let i = 0; i < results.length; i++) {
        if (results[i].user.name === undefined) {
          results[i].user.name = "";
        }
      }
      done();
    });
});

module.exports = agenda;
