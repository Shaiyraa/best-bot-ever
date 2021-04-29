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
  name: "events",
  description: ""
};

/*
?events
lists every active event in the guild as an embed message
reaction icons for:
 - delete
 - edit
 - maybe attendance

*/