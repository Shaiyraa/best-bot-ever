const config = require("./config.json");

const Event = require("./db/eventSchema");

module.exports = async (bot) => {

  // 1. get messageId for events that are in the future from db
  const eventsArray = await Event.find({ date: { $gt: Date.now() }, active: true })

  eventsArray.forEach(async event => {

    // 2. fetch event message
    const guild = await bot.guilds.fetch(event.guild.id)
    const channel = await guild.channels.cache.get(event.guild.announcementsChannel)
    const eventMessage = await channel.messages.fetch(event.messageId).catch(console.log)

    // 3. set listener
    const filter = (reaction, user) => {
      let emojis = [config.yesEmoji, config.noEmoji]

      if (!emojis.includes(reaction.emoji.name)) {
        let reactionMap = eventMessage.reactions.resolve(reaction.emoji.name);
        reactionMap?.users.remove(user.id);
      }

      return emojis.includes(reaction.emoji.name);
    };
    const collector = eventMessage.createReactionCollector(filter, { dispose: true });
    collector.on('collect', (reaction, user) => {
      switch (reaction.emoji.name) {
        case config.yesEmoji: {
          let yesReactionMap = eventMessage.reactions.resolve(config.yesEmoji)

          if (yesReactionMap.count > event.attendance + 1) {
            user.send("The list is full.")
            yesReactionMap.users.remove(user.id)
            break;
          }

          // disable multiple options
          let noReactionMap = eventMessage.reactions.resolve(config.noEmoji);
          if (noReactionMap.users.cache.get(user.id)) {
            noReactionMap.users.remove(user.id);
          };
          break;
        }
        case config.noEmoji: {
          let reactionMap = eventMessage.reactions.resolve(config.yesEmoji)

          if (reactionMap.users.cache.get(user.id)) {
            reactionMap.users.remove(user.id)
          }
          break;
        }
      }
    })
  })
}
