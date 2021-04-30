
module.exports = async (message, event, guildConfig) => {

  message.channel.send("Type \"yes\" to confirm.")

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(async m => {
      m = m.first();
      if (m.content.toLowerCase() === "yes") {

        event.active = false;
        await event.save();

        // delete the reaction message
        const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
        let eventMessage = await channel.messages.fetch(event.messageId);
        eventMessage.delete();

      };
    })
    .catch((err) => {
      console.log(err);
    });
};