const Guild = require("../db/guildSchema");
const sendEmbedMessage = require("./sendEmbedMessage");

const tagUsersWithMessage = async (guild, userTagsArray, title, description = "") => {
  // find the channel to remind
  const guildDoc = await Guild.findOne({ id: guild.id });
  const channel = await guild.channels.resolve(guildDoc.remindersChannel);

  // send a message mentioning the users
  await sendEmbedMessage(channel, title, userTagsArray, description)
}

module.exports = tagUsersWithMessage