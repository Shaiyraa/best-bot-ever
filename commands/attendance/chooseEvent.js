const chooseGroup = require("./chooseGroup");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");

module.exports = async (message, eventArray, guildConfig) => {

  // list available events
  const eventTypesArray = eventArray.map((item, index) => `${index + 1}: ${item.type} - ${item.date.getHours()}:${item.date.getMinutes() < 10 ? '0' + item.date.getMinutes() : item.date.getMinutes()}`);
  const reactionMessage = await sendEmbedMessage(message.channel, "Choose number to show event details:", eventTypesArray);

  const emojis = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3"];

  // react
  eventArray.map(async (item, index) => {
    await reactionMessage.react(emojis[index]);
  });

  //create collector
  const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = reactionMessage.createReactionCollector(filter, { max: 1, time: 30000 });
  collector.on('collect', (reaction, user) => {
    let eventId;
    emojis.forEach((item, index) => {
      if (reaction.emoji.name === item) {
        eventId = eventArray[index].messageId;
      };
    });

    chooseGroup(message, eventId, guildConfig);
  });
};