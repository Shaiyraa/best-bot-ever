const Discord = require("discord.js");
const Guild = require("../../db/guildSchema");

const validateResponseRegex = require("../../utils/validateResponseRegex")

module.exports.run = async (bot, message, args) => {

  // TODO: write a similar function that will check if channel/role exists in the guild
  message.channel.send("Provide a value for memberRole:")
  let memberRoleTag = await validateResponseRegex(message, "Invalid date", /([A-Z]||[a-z])\w+/g)
  if (memberRoleTag === "exit") {
    return
  }
  memberRoleValue = memberRoleTag.replace(/([<>@&#])+/g, "");

  message.channel.send("Provide a value for announcementsChannel:")
  let announcementsChannelTag = await validateResponseRegex(message, "Invalid date", /([A-Z]||[a-z])\w+/g)
  console.log(announcementsChannelTag)
  if (announcementsChannelTag === "exit") {
    return
  }
  announcementsChannelValue = announcementsChannelTag.replace(/([<>@&#])+/g, "");

  message.channel.send("Provide a value for remindersChannel:")
  let remindersChannelTag = await validateResponseRegex(message, "Invalid date", /([A-Z]||[a-z])\w+/g)
  if (remindersChannelTag === "exit") {
    return
  }
  remindersChannelValue = remindersChannelTag.replace(/([<>@&#])+/g, "");

  message.channel.send("Provide a value for commandsChannel:")
  let commandsChannelTag = await validateResponseRegex(message, "Invalid date", /([A-Z]||[a-z])\w+/g)
  if (commandsChannelTag === "exit") {
    return
  }
  commandsChannelValue = commandsChannelTag.replace(/([<>@&#])+/g, "");


  let guild = await Guild.find({ id: message.channel.guild.id })

  if (!guild.length) {
    console.log("asd")
    const newGuild = await Guild.create({
      id: message.channel.guild.id,
      memberRole: memberRoleValue,
      announcementsChannel: announcementsChannelValue,
      remindersChannel: remindersChannelValue,
      commandsChannel: commandsChannelValue
    })
      .catch(console.log)
  } else {
    console.log(guild)
    guild = guild[0]
    guild.memberRole = memberRoleValue
    guild.announcementsChannel = announcementsChannelValue
    guild.remindersChannel = remindersChannelValue
    guild.commandsChannel = commandsChannelValue
    await guild.save()
  }

  message.channel.send("Config updated.")
};

module.exports.help = {
  name: "config",
  description: "Config command for GM and officers to set up stuff so other commands work properly"
};

//1. ?config
  // ask for every parameter and corresponding values (one by one)

//2. ?config memberRole
  // ask for value

//3. ?config memberRole member

// create guild document if its not in db yet
// insert value(s) for parameter(s)

/*
Config command for gm and officers to set up stuff so other commands work properly

?config [config item] [value]

Parameters:
- memberRole
- announcementsChannel
- remindersChannel
- commandsChannel
and more coming probably

cases:
  - command has no params: ask for values for every config param
  - command has 1 param: ask for value
  - command has 2 params

check if param exist and find id for provided value, then insert the ids to guild document:
  - if guild document doesnt exist in db, create one and insert the ids
  - if it exists, just insert the ids

*/