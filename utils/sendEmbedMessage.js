const Discord = require("discord.js");

module.exports = async (channel, title, description = "", msg = "") => {
  const embed = new Discord.MessageEmbed().setDescription(description).setTitle(title);
  const embedMessage = await channel.send(msg, { "embed": embed }); // "allowedMentions": { "users": [] }
  return embedMessage;
};