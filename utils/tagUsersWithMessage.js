const Guild = require("../db/guildSchema");
const sendEmbedMessage = require("./sendEmbedMessage");

module.exports = async (guild, title, description, message, guildConfig) => {
  // find the channel to remind
  if (!guildConfig) guildConfig = await Guild.findOne({ id: guild.id });
  const channel = await guild.channels.resolve(guildConfig.remindersChannel);

  // send a message mentioning the users
  await sendEmbedMessage(channel, title, description, message)
}