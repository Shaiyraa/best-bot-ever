
module.exports = async (message, guildConfig) => {

  const hasRole = message.member.roles.cache.find(r => r.id === guildConfig.officerRole)
  return hasRole
}