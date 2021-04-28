const Discord = require("discord.js");
const isGuildConfigInDB = require("../../utils/isGuildConfigInDB")

module.exports.run = async (bot, message, args) => {
  const guildConfig = await isGuildConfigInDB(message.guild.id)
  if (!guildConfig) {
    message.channel.send("Server config doesn't exist. Try ?config or ?help to get more info.");
    return;
  }

  message.channel.send('Hello!');
};

module.exports.help = {
  name: "poll",
  description: ""
};



/*
Command to create a poll on desired channel - announcements?

?poll [limit] [option1] [option2] [option3]

Parameters:
- limit - single reaction or many choices possible (default true)

*/