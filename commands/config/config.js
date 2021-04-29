const Discord = require("discord.js");
const config = require("../../config.json");

const Guild = require("../../db/guildSchema");

const validateResponseRegex = require("../../utils/validateResponseRegex")

module.exports.run = async (bot, message, args) => {

  const validateResponseRole = async (errMessage) => {
    let response = ""

    const filter = m => m.author.id === message.author.id;
    await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
      .then(m => {
        m = m.first();
        if (!m || m.content.startsWith(config.prefix)) {
          return response = "exit"
        }
        response = m.content
      })
      .catch((err) => {
        response = "exit"
        console.log(err)
      });

    if (response === "exit") return response

    response = response.replace(/([<>@&])+/g, "");

    if (message.guild.roles.cache.get(response)) return response

    if (response !== "exit") message.channel.send(errMessage)
    return await validateResponseRole(errMessage)
  }

  const validateResponseChannel = async (errMessage) => {
    let response = ""

    const filter = m => m.author.id === message.author.id;
    await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
      .then(m => {
        m = m.first();
        if (!m || m.content.startsWith(config.prefix)) {
          return response = "exit"
        }
        response = m.content
      })
      .catch((err) => {
        response = "exit"
        console.log(err)
      });

    if (response === "exit") return response

    response = response.replace(/([<>&#])+/g, "");
    if (message.guild.channels.cache.get(response)) return response

    if (response !== "exit") message.channel.send(errMessage)
    return await validateResponseChannel(errMessage)
  }

  // ask for memberRole
  message.channel.send("Provide a value for memberRole:")
  let memberRoleTag = await validateResponseRole("Invalid role")
  if (memberRoleTag === "exit") return

  // ask for announcementsChannel
  message.channel.send("Provide a value for announcementsChannel:")
  let announcementsChannelTag = await validateResponseChannel("Invalid channel")
  if (announcementsChannelTag === "exit") return

  // ask for remindersChannel
  message.channel.send("Provide a value for remindersChannel:")
  let remindersChannelTag = await validateResponseChannel("Invalid channel")
  if (remindersChannelTag === "exit") {
    return
  }

  // ask for commandsChannel
  message.channel.send("Provide a value for commandsChannel:")
  let commandsChannelTag = await validateResponseChannel("Invalid channel")
  if (commandsChannelTag === "exit") {
    return
  }


  let guild = await Guild.find({ id: message.channel.guild.id })

  if (!guild.length) {
    await Guild.create({
      id: message.channel.guild.id,
      memberRole: memberRoleValue,
      announcementsChannel: announcementsChannelValue,
      remindersChannel: remindersChannelValue,
      commandsChannel: commandsChannelValue
    })
  } else {
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