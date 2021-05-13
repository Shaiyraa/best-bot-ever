const Discord = require("discord.js");
const config = require("../../config.json");

const Guild = require("../../db/guildSchema");

const validateResponseRegex = require("../../utils/validateResponseRegex")

module.exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) {
    message.channel.send("Only administrators can this command.")
    return
  }

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
  message.channel.send("Tag guild member role:")
  let memberRoleTag = await validateResponseRole("Invalid role")
  if (memberRoleTag === "exit") {
    message.channel.send("Bye!");
    return;
  }

  // ask for officerRole
  message.channel.send("Tag guild officer role:")
  let officerRoleTag = await validateResponseRole("Invalid role")
  if (officerRoleTag === "exit") {
    message.channel.send("Bye!");
    return;
  }
  // ask for announcementsChannel
  message.channel.send("Tag the channel where you want your event announcements to pop up:")
  let announcementsChannelTag = await validateResponseChannel("Invalid channel")
  if (announcementsChannelTag === "exit") {
    message.channel.send("Bye!");
    return;
  }

  // ask for remindersChannel
  message.channel.send("Tag the channel where you want to see reminders for events:")
  let remindersChannelTag = await validateResponseChannel("Invalid channel")
  if (remindersChannelTag === "exit") {
    message.channel.send("Bye!");
    return;
  }

  // ask for commandsChannel
  message.channel.send("Tag the channel for bot commands:")
  let commandsChannelTag = await validateResponseChannel("Invalid channel")
  if (commandsChannelTag === "exit") {
    message.channel.send("Bye!");
    return;
  }


  let guild = await Guild.find({ id: message.channel.guild.id })

  if (!guild.length) {
    await Guild.create({
      id: message.channel.guild.id,
      memberRole: memberRoleTag,
      officerRole: officerRoleTag,
      announcementsChannel: announcementsChannelTag,
      remindersChannel: remindersChannelTag,
      commandsChannel: commandsChannelTag
    })
  } else {
    guild = guild[0]
    guild.memberRole = memberRoleTag
    guild.officerRole = officerRoleTag
    guild.announcementsChannel = announcementsChannelTag
    guild.remindersChannel = remindersChannelTag
    guild.commandsChannel = commandsChannelTag
    await guild.save()
  }

  message.channel.send("Config updated.")
};

module.exports.help = {
  name: "config",
  description: "?config \nbot will ask for guild member role and channels to send messages on, so other commands can work properly"
};