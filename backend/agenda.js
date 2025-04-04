const Agenda = require("agenda");
require("dotenv").config();

const mongoConnectionString = process.env.MONGO_URI;

const agenda = new Agenda({ db: { address: mongoConnectionString, collection: "jobs" } });

agenda.define("send email", async (job) => {
    const { to, subject, body } = job.attrs.data;
    const sendEmail = require("./mailer");
    await sendEmail(to, subject, body);
});

(async function () {
    await agenda.start();
    console.log("Agenda started for scheduling jobs.");
})();

module.exports = agenda;