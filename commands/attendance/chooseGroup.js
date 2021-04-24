const chooseAction = require("./chooseAction");
const Guild = require("../../db/guildSchema");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const getArrayOfUsers = require("../../utils/getArrayOfUsers");

module.exports = async (message, eventId) => {
  let emojis = ["✅", "❌", "❔", "🌐"];
  const reactionMessage = await sendEmbedMessage(message.channel, "Choose group of people you wanna see:", "✅ - Yes\n❌ - No\n❔ - Undecided\n🌐 - Show all three groups");
  emojis.map(async item => {
    await reactionMessage.react(item);
  })

  const guild = await Guild.findOne({ id: message.channel.guild.id })
  const channel = await message.guild.channels.resolve(guild?.announcementsChannel) || message.channel;
  const eventMessage = await channel.messages.fetch(eventId).catch(console.log)

  if (!eventMessage) {
    message.channel.send("Event message doesn't exist anymore.");
    return;
  }

  const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = reactionMessage.createReactionCollector(filter, { max: 1, time: 30000, dispose: true });
  collector.on('collect', async (reaction, user) => {

    const getArrayOfUsersAndSendMessage = async (reaction) => {
      // set title depending on the reaction
      let title
      reaction === "❔" ? title = `Here are the people that didn't react:` : title = `Here are the people that reacted with ${reaction}:`

      const usersArray = await getArrayOfUsers(reaction, eventMessage);
      const reactionGroupMessage = await sendEmbedMessage(message.channel, title, usersArray);
      chooseAction(message, eventMessage, reactionGroupMessage);
    }

    // ONE
    if (reaction.emoji.name === "✅" || reaction.emoji.name === "❌" || reaction.emoji.name === "❔") {
      await getArrayOfUsersAndSendMessage(reaction.emoji.name)
    };

    // ALL
    if (reaction.emoji.name === "🌐") {
      await getArrayOfUsersAndSendMessage("✅")
      await getArrayOfUsersAndSendMessage("❌")
      await getArrayOfUsersAndSendMessage("❔")
    };
  });
};


