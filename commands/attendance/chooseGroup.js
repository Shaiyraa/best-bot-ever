const config = require("../../config.json");
const chooseAction = require("./chooseAction");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const getArrayOfUsers = require("../../utils/getArrayOfUsers");

module.exports = async (message, eventId, guildConfig) => {
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
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
  const eventMessage = await channel.messages.fetch(eventId);

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
      reaction === config.undecidedEmoji ? title = "Here are the people that didn't react:" : title = `Here are the people that reacted with ${reaction}:`;

      let usersArray = await getArrayOfUsers(reaction, eventMessage, guildConfig);
      if (!usersArray.length) usersArray = "No users";
      const reactionGroupMessage = await sendEmbedMessage(message.channel, title, usersArray);
      chooseAction(message, eventMessage, reactionGroupMessage, guildConfig);
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