const config = require("../../config.json");
const chooseAction = require("./chooseAction");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const getArrayOfUsers = require("../../utils/getArrayOfUsers");

const Guild = require("../../db/guildSchema");

module.exports = async (message, eventId) => {
  const reactionMessage = await sendEmbedMessage(
    message.channel,
    "Choose group of people you wanna see:",
    `${config.yesEmoji} - Yes\n${config.noEmoji} - No\n${config.undecidedEmoji} - Undecided\n${config.allGroupsEmoji} - Show all three groups`
  );

  let emojis = [config.yesEmoji, config.noEmoji, config.undecidedEmoji, config.allGroupsEmoji];

  emojis.map(async item => {
    await reactionMessage.react(item);
  });

  // get event message
  const guild = await Guild.findOne({ id: message.channel.guild.id });
  const channel = await message.guild.channels.resolve(guild.announcementsChannel);
  const eventMessage = await channel.messages.fetch(eventId).catch(console.log);

  if (!eventMessage) {
    message.channel.send("Event message doesn't exist anymore.");
    return;
  };

  const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = reactionMessage.createReactionCollector(filter, { max: 1, time: 30000, dispose: true });
  collector.on('collect', async (reaction, user) => {

    const getArrayOfUsersAndSendMessage = async (reaction) => {
      // set title depending on the reaction
      let title;
      reaction === undecidedEmoji ? title = "Here are the people that didn't react:" : title = `Here are the people that reacted with ${reaction}:`;

      const usersArray = await getArrayOfUsers(reaction, eventMessage);
      const reactionGroupMessage = await sendEmbedMessage(message.channel, title, usersArray);
      chooseAction(message, eventMessage, reactionGroupMessage);
    }

    switch (reaction.emoji.name) {
      case config.yesEmoji:
      case config.noEmoji:
      case config.undecidedEmoji: {
        await getArrayOfUsersAndSendMessage(reaction.emoji.name);
        break;
      };
      case config.allGroupsEmoji: {
        await getArrayOfUsersAndSendMessage(config.yesEmoji);
        await getArrayOfUsersAndSendMessage(config.noEmoji);
        await getArrayOfUsersAndSendMessage(config.undecidedEmoji);
        break;
      };
    };
  });
};


