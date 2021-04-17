const Discord = require("discord.js");

module.exports = async (message, title, description = "", msg = "") => {
  const embed = new Discord.MessageEmbed().setDescription(description).setTitle(title);
  const embedMessage = await message.channel.send(msg, { "allowedMentions": { "users": [] }, "embed": embed });
  return embedMessage;
};