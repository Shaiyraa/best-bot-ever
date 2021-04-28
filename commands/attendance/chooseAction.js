const config = require("../../config.json");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const tagUsersWithMessage = require("../../utils/tagUsersWithMessage")

module.exports = async (message, event, groupMessage, guildConfig) => {

  // get list of user tags from the message and create an array of of it or return if its empty
  if (groupMessage.embeds[0].description === "No users") return;
  const userTagsArray = groupMessage.embeds[0].description.split("\n");

  let emojis = [config.messageEmoji, config.alertEmoji];

  emojis.map(async item => {
    await groupMessage.react(item);
  });

  const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = groupMessage.createReactionCollector(filter, { max: 1, time: 30000, dispose: true });
  collector.on('collect', async (reaction, user) => {
    switch (reaction.emoji.name) {
      case config.messageEmoji: {

        // ask for the content of the message
        await sendEmbedMessage(message.channel, "Provide the content of the message:");

        // wait for an answer
        const filter = m => m.author.id === message.author.id;
        await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
          .then(m => {
            let dm = m.first().content;

            // return if message is a command
            if (!dm || dm.startsWith(config.prefix)) {
              message.channel.send("Cannot send a command as a message.");
              return;
            }

            // get IDs from the tags and send messages
            const userIdsArray = userTagsArray.map(async item => {
              let id = item.replace(/([<>@])+/g, "");
              message.channel.guild.members.cache.get(id).send(dm).catch(err => {
                if (err.code === 50007) return;
                console.log(err);
              });
            });
            message.channel.send("Messages sent!");
          })
          .catch(err => {
            message.channel.send("Something went wrong!");
            console.log(err);
          });
        break;
      };
      case config.alertEmoji: {
        //sendReminder(message.guild, userTagsArray, "Reminder to react:", `[Link](${event.url})`, guildConfig)
        tagUsersWithMessage(message.guild, "Reminder to react:", `[Link to the event](${event.url})`, userTagsArray, "", guildConfig);
        break;
      };
    };
  });
};