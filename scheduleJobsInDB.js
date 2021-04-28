const schedule = require("node-schedule");
const config = require("./config.json")

const getArrayOfUsers = require("./utils/getArrayOfUsers");
const tagUsersWithMessage = require("./utils/tagUsersWithMessage");

const Job = require("./db/jobSchema");

const scheduleJobsInDB = async (bot) => {
  let jobsArray = await Job.find()
  jobsArray = jobsArray.filter(job => job.date > Date.now() && job.event.active === true && job.event.alerts === "yes")

  jobsArray.forEach(async job => {
    let title
    let type
    switch (job.event.date - job.date) {
      case 7200000: {
        type = config.undecidedsEmoji
        title = "There's an event starting in 2 hours! Let your officers know if you're gonna be there."
        break;
      }
      case 3600000: {
        type = config.yesEmoji
        title = "There's an event starting in 1 hour! Time to buff up and prepare."
        break;
      }
      case 900000: {
        type = config.yesEmoji
        title = "Get in voice chat, the event starts in 15 minutes!"
        break;
      }
    }

    schedule.scheduleJob(job.date, async function () {
      const guild = await bot.guilds.fetch(job.event.guild.id)
      const eventMessage = await guild.channels.cache.get(job.event.guild.announcementsChannel).messages.fetch(job.event.messageId)
      let usersArray = await getArrayOfUsers(type, eventMessage, job.event.guild)
      if (!usersArray.length) usersArray = "No users"
      await tagUsersWithMessage(guild, usersArray, title, "", job.event.guild)
    }
    );
  });
}

module.exports = scheduleJobsInDB