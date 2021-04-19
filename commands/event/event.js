const Discord = require("discord.js");
const Event = require('../../db/eventSchema');
const guildConfig = require("../../guild-config");

module.exports.run = async (bot, message, args) => {
  let params = []
  const filter = m => m.author.id === message.author.id;
  const validateResponseRegex = async (errMessage, conditions) => {
    let response = ''

    await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
      .then(m => {
        m = m.first();
        response = m.content
      })
      .catch((err) => {
        response = "exit"
        console.log(err)
      });

    if (response.match(conditions) || response === "exit") {
      return response
    }

    message.channel.send(errMessage)
    return await validateResponseRegex(errMessage, conditions)
  }

  const validateResponse = async (errMessage, conditions) => {
    let response = ''

    await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
      .then(m => {
        m = m.first();
        response = m.content
      })
      .catch((err) => {
        response = "exit"
        console.log(err)
      });

    if (conditions.includes(response) || response === "exit") {
      return response
    }

    message.channel.send(errMessage)
    return await validateResponse(errMessage, conditions)
  }

  if (args.length > 0) {

    params[0] = args[0];
    params[1] = args[1] || "nodewar";
    params[2] = args[2] || "20:00";
    params[3] = parseInt(args[3], 10) || 100
    params[4] = args[4] || "yes"
    params[5] = args[5] || "yes"
  } else {

    // ask for date
    message.channel.send("What is the date of the event?")
    params[0] = await validateResponseRegex("Invalid date", /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)
    if (params[0] === "exit") return

    // ask for type
    message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent".')
    params[1] = await validateResponse("Invalid response (nodewar, siege, guildevent)", ['nodewar', 'siege', 'guildevent'])
    if (params[1] === "exit") return

    // ask for hour
    message.channel.send('What time is the event?')
    params[2] = await validateResponseRegex("Invalid time.", /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g)
    if (params[2] === "exit") return

    // ask for maxAttendance
    message.channel.send("What is the max attendance of the event?")
    params[3] = await validateResponseRegex("Invalid answer (1-100).", /^0*(?:[1-9][0-9]?|100)$/g)
    if (params[3] === "exit") return

    // ask for mandatory
    message.channel.send("Is the event mandatory?")
    params[4] = await validateResponse("Invalid answer (yes/no).", ["yes", "no"])
    if (params[4] === "exit") return

    // ask for alerts
    message.channel.send("Do you want to enable automatic alerts?")
    params[5] = await validateResponse("Invalid answer (yes/no).", ["yes", "no"])
    if (params[5] === "exit") return
  }

  // ask for content
  let content = ""
  message.channel.send("Do you want to create a custom message (yes/no)?")
  const contentResponse = await validateResponse("Invalid answer (yes/no).", ["yes", "no"])

  switch (contentResponse) {
    case "exit": {
      return
    }
    case "yes": {
      message.channel.send("Type in the content:")
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
  const embed = new Discord.MessageEmbed().setDescription(`EVENT: ${params[1]}\nDATE: ${params[0]}\nMAX ATTENDANCE: ${params[3]}\n${content}`);
  let messageId;
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel) || message.channel
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
      }
      return
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
    date: new Date(params[0]),
    type: params[1],
    hour: params[2],
    maxAttendance: params[3],
    mandatory: params[4],
    alerts: params[5],
    content,
    messageId
  }).catch(console.log)
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

