const Guild = require("../db/guildSchema");
const sendEmbedMessage = require("./sendEmbedMessage");

module.exports = async (guild, title, description, message = "") => {
  // find the channel to remind
  const guildDoc = await Guild.findOne({ id: guild.id });
  const channel = await guild.channels.resolve(guildDoc.remindersChannel);

  // send a message mentioning the users
  await sendEmbedMessage(channel, title, description, message)
}