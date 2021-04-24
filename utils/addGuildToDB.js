const Guild = require("../db/guildSchema")

const addGuildToDB = async (guild, memberRole, announcementsChannel, remindersChannel, commandsChannel) => {
  // check if the guild document already exists
  let doc = await Guild.find({ id: guild.id })
  if (doc.length) return

  const newGuild = await Guild.create({
    id: guild.id,
    memberRole,
    announcementsChannel,
    remindersChannel,
    commandsChannel
  })
    .catch(console.log)
}

module.exports = addGuildToDB