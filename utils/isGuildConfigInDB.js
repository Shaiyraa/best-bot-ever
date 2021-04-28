const Guild = require("../db/guildSchema");

module.exports = async (guildId) => {

  // find guild
  const guild = Guild.findOne({ id: guildId })

  if (!guild) {
    return false
  }
  // return guild object if config exists
  return guild
}