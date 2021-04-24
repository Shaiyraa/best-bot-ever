const Discord = require("discord.js");
const Guild = require("../../db/guildSchema");
const Event = require("../../db/eventSchema");
const Job = require("../../db/jobSchema");
const validateResponseRegex = require("../../utils/validateResponseRegex")
const validateResponse = require("../../utils/validateResponse")
const getArrayOfUsers = require("../../utils/getArrayOfUsers")
const tagUsersWithMessage = require("../../utils/tagUsersWithMessage")
const schedule = require('node-schedule');

module.exports.run = async (bot, message, args) => {
  let params = []

  if (args.length > 0) {
    if (!args[0].match(/^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)) {
      message.channel.send("Invalid date (correct format: ?event dd-mm-yyyy).");
      return;
    };

    params[0] = args[0];
    params[1] = args[1] || "nodewar";
    params[2] = args[2] || "20:00";
    params[3] = parseInt(args[3], 10) || 100
    params[4] = args[4] || "yes"
    params[5] = args[5] || "yes"

  } else {
    // ask for date
    message.channel.send("What is the date of the event?")
    params[0] = await validateResponseRegex(message, "Invalid date format", /^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)
    if (params[0] === "exit") {
      return
    }

    // ask for type
    message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent".')
    params[1] = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ['nodewar', 'siege', 'guildevent'])
    if (params[1] === "exit") {
      return
    }

    // ask for hour
    message.channel.send('What time is the event?')
    params[2] = await validateResponseRegex(message, "Invalid time.", /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g)
    if (params[2] === "exit") {
      return
    }

    // ask for maxAttendance
    message.channel.send("What is the max attendance of the event?")
    params[3] = await validateResponseRegex(message, "Invalid answer (1-100).", /^0*(?:[1-9][0-9]?|100)$/g)
    if (params[3] === "exit") {
      return
    }

    // ask for mandatory
    message.channel.send("Is the event mandatory?")
    params[4] = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"])
    if (params[4] === "exit") {
      return
    }

    // ask for alerts
    message.channel.send("Do you want to enable automatic alerts?")
    params[5] = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"])
    if (params[5] === "exit") {
      return
    }
  }

  params[0] = new Date(params[0].split(/\D/g)[2], params[0].split(/\D/g)[1] - 1, params[0].split(/\D/g)[0], params[2].split(":")[0], params[2].split(":")[1])
  const event = await Event.findOne({ date: params[0] })
  if (event) {
    message.channel.send("There's already an event scheduled for this time and date.")
    return
  }

  // ask for content
  let content = "no message"
  message.channel.send("Do you want to create a custom message (yes/no)?")
  const contentResponse = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"])

  switch (contentResponse) {
    case "exit": {
      return
    }
    case "yes": {
      message.channel.send("Type in the content:")
      const filter = m => m.author.id === message.author.id;
      await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
        .then(m => {
          m = m.first();
          content = m.content.toLowerCase()
        })
        .catch((err) => {
          console.log(err)
        });
    }
  }

  // SEND THE MESSAGE WITH REACTION ICONS
  const embed = new Discord.MessageEmbed()
    .addField("Event:", params[1], false)
    .setDescription(params[4] === "yes" ? "Mandatory" : "Non mandatory")
    .addField("Date:", params[0].toLocaleDateString("en-GB"), true)
    .addField("Time:", params[2], true)
    .addField("Max. Attendance:", params[3], false)
    .addField("Details:", content, false)
    .setColor(params[4] === "yes" ? "#ff0000" : "#daf7a6");

  let messageId;
  const guild = await Guild.findOne({ id: message.channel.guild.id })
  const channel = await message.guild.channels.resolve(guild?.announcementsChannel) || message.channel
  const reactionMessage = await channel.send(embed).then(sent => {
    messageId = sent.id;
    return sent;
  }).catch(console.log);

  await reactionMessage.react("✅");
  await reactionMessage.react("❌");

  const filter2 = (reaction, user) => {
    let emojis = ["✅", "❌"]
    return emojis.includes(reaction.emoji.name);
  };

  const collector = reactionMessage.createReactionCollector(filter2, { dispose: true });
  collector.on('collect', (reaction, user) => {

    // CHECK MAX ATTENDANCE FOR YES
    if (reaction.emoji.name === "✅") {
      let reactionMap = reactionMessage.reactions.resolve("✅")

      if (reactionMap.count > params[3]) {
        user.send("The list is full.")
        reactionMap.users.remove(user.id)
        return
      }
    }

    // DISABLE MULTIPLE OPTIONS
    if (reaction.emoji.name === "✅") {
      let reactionMap = reactionMessage.reactions.resolve("❌")

      if (reactionMap.users.cache.get(user.id)) {
        reactionMap.users.remove(user.id)
      }
    }

    if (reaction.emoji.name === "❌") {
      let reactionMap = reactionMessage.reactions.resolve("✅")

      if (reactionMap.users.cache.get(user.id)) {
        reactionMap.users.remove(user.id)
      }
    }
  });

  const doc = await Event.create({
    date: params[0],
    type: params[1],
    maxAttendance: params[3],
    mandatory: params[4],
    alerts: params[5],
    messageId,
    guild: guild._id
  }).catch(console.log)

  let tagUndecided = new Date(params[0])
  tagUndecided.setHours(tagUndecided.getHours() - 2)

  let tagYes = new Date(params[0])
  tagYes.setHours(tagYes.getHours() - 1)

  let tagYesVoice = new Date(params[0])
  tagYesVoice.setMinutes(tagYesVoice.getMinutes() - 15)

  await Job.create({
    event: doc._id,
    date: tagUndecided
  })
  await Job.create({
    event: doc._id,
    date: tagYes
  })
  await Job.create({
    event: doc._id,
    date: tagYesVoice
  })

  schedule.scheduleJob(tagUndecided, async function () {
    let usersArray = await getArrayOfUsers("❔", reactionMessage)
    await tagUsersWithMessage(message.guild, usersArray, "There's an event starting in 2 hours! Let your officers know if you're gonna be there.")
  });
  schedule.scheduleJob(tagYes, async function () {
    let usersArray = await getArrayOfUsers("✅", reactionMessage)
    await tagUsersWithMessage(message.guild, usersArray, "There's an event starting in 1 hour! Time to buff up and prepare.")
  });
  schedule.scheduleJob(tagYesVoice, async function () {
    let usersArray = await getArrayOfUsers("✅", reactionMessage)
    await tagUsersWithMessage(message.guild, usersArray, "Get in voice chat, the event starts in 15 minutes!")
  });
};


module.exports.help = {
  name: "event",
  description: "set new event"
};

/*
event creator = making guild event management simpler for the officers


?event [date] optional: [type] [hour] [maxAttendance] [mandatory] [alerts] [content]

Parameters:
- date
- type: nodewar, siege, guildevent
- hour (default for nodewar/siege: 20:00)
- maxAttendance = max 100 (default 100)
- mandatory (default: true)
- alerts (default: true)

if required params are not provided, bot will ask about every param including optional ones
ask if you wanna add content


- send a message with reactions YES and NO on channel specified in guild config or on the channel where command was sent, if there is no config
- save the event details and messageId in db

- TODO: waitlist?

 - if max attendance is lower than default, block reacting after reaching max attendance
*/

