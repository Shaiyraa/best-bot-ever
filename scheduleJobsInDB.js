const Job = require("./db/jobSchema");
const schedule = require('node-schedule');
const getArrayOfUsers = require("./utils/getArrayOfUsers");
const tagUsersWithMessage = require("./utils/tagUsersWithMessage");

// get the jobs from db and schedule them
const scheduleJobsInDB = async (bot) => {
  const jobsArray = await Job.find()

  let asd = Date.now()

  jobsArray.forEach(async job => {
    let title
    let type
    //console.log(`Scheduled job for event ${job.event} at ${job.date}`)
    switch (job.event.date - job.date) {
      case 7200000: {
        type = "❔"
        title = "There's an event starting in 2 hours! Let your officers know if you're gonna be there."
        break;
      }
      case 3600000: {
        type = "✅"
        title = "There's an event starting in 1 hour! Time to buff up and prepare."
        break;
      }
      case 900000: {
        type = "✅"
        title = "Get in voice chat, the event starts in 15 minutes!"
        break;
      }
    }

    schedule.scheduleJob(job.date, async function () {
      const guild = await bot.guilds.fetch(job.event.guild.id)
      const eventMessage = await guild.channels.cache.get(job.event.guild.announcementsChannel).messages.fetch(job.event.messageId)
      let usersArray = await getArrayOfUsers(type, eventMessage)

      await tagUsersWithMessage(guild, usersArray, title)
    }
    );
  });
}

module.exports = scheduleJobsInDB









/*const Job = require("./db/jobSchema");
const schedule = require('node-schedule');
const getArrayOfUsers = require("./utils/getArrayOfUsers");
const tagUsersWithMessage = require("./utils/tagUsersWithMessage");

// get the jobs from db and schedule them
const scheduleJobsInDB = async (bot) => {
  const jobsArray = await Job.find()

  let asd = Date.now()

  jobsArray.forEach(async job => {
    let reaction
    let type
    //console.log(`Scheduled job for event ${job.event} at ${job.date}`)
    switch (job.event.date - job.date) {
      case 7200000: {
        type = "undecided"
        title = "There's an event starting in 2 hours! Let your officers know if you're gonna be there."
      }
      case 3600000: {
        type = "yes"
        title = "There's an event starting in 1 hour! Time to buff up and prepare."
      }
      case 900000: {
        type = "yes"
        title = "Get in voice chat, the event starts in 15 minutes!"
      }
    }
    const guild = await bot.guilds.fetch(job.event.guild.id)
    console.log(guild)

    const channel = await guild.channels.resolve(job.event.guild.announcementsChannel)
    console.log(channel)
    const eventMessage = channel.messages.fetch(job.event.messageId)
    schedule.scheduleJob(job.date, async function () {
      const guild = await bot.guilds.fetch(job.event.guild.id)
      console.log(guild)
      const eventMessage = await guild.channels.cache.get(job.event.guild.announcementsChannel).messages.fetch(job.event.messageId)
      console.log(eventMessage)
      let usersArray = await getArrayOfUsers(type, eventMessage)
      const channel = await guild.channels.resolve(job.event.guild.remindersChannel)

      tagUsersWithMessage(guild, title, usersArray)
    }
    );
  });
}

module.exports = scheduleJobsInDB */