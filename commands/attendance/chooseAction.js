const Discord = require("discord.js");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const guildConfig = require("../../guild-config");

module.exports = async (message, event, groupMessage) => {

  // get list of user tags from the message and create an array of of it
  const userTagsArray = groupMessage.embeds[0].description.split("\n");

  // check if the array contains any IDs TODO: make it less brainless 
  if (userTagsArray[0] === "No users") {
    return
  }

  await groupMessage.react("✉️");
  await groupMessage.react("❗");

  const filter = (reaction, user) => {
    let emojis = ["✉️", "❗"];
    return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  };

  const collector = groupMessage.createReactionCollector(filter, { max: 1, time: 30000, dispose: true });
  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === "✉️") {

      // ask for the content of the message
      await sendEmbedMessage(message, "Provide the content of the message:");

      // wait for an answer
      const filter = m => m.author.id === message.author.id;
      let dm = ""
      await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
        .then(m => {
          dm = m.first();
        })
        .catch(() => message.channel.send("Time is up!"));

      // get IDs from the tags and send messages
      const userIdsArray = userTagsArray.map(async item => {
        let id = item.replace(/([<>@])+/g, "");
        message.channel.guild.members.cache.get(id).send(dm).catch(() => message.channel.send("Something went wrong!"))
      })
    };
    message.channel.send("Messages sent!")

    if (reaction.emoji.name === "❗") {

      // find the channel to remind
      const channel = await message.guild.channels.resolve(guildConfig.remindersChannel);

      // send a message mentioning the users
      const embed = new Discord.MessageEmbed().setDescription(`[Link to the event](${event.url})`).setTitle("Reminder to react:");
      const embedMessage = await channel.send(embed);

      channel.send(userTagsArray);
    };
  });
};