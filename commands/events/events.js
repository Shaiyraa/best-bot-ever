const Discord = require("discord.js");
const isGuildConfigInDB = require("../../utils/isGuildConfigInDB")
const Event = require("../../db/eventSchema");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const config = require("../../config.json");
const editEvent = require("./editEvent");
const deleteEvent = require("./deleteEvent");

module.exports.run = async (bot, message, args) => {

  const guildConfig = await isGuildConfigInDB(message.guild.id)
  if (!guildConfig) {
    message.channel.send("Server config doesn't exist. Try ?config or ?help to get more info.");
    return;
  }

  let events = await Event.find({ active: true }).sort({ date: 1 })
  events = events.filter(event => event.guild.id === guildConfig.id)

  if (!events.length) message.channel.send("There are no scheduled events.")

  events.forEach(async event => {
    const embed = new Discord.MessageEmbed()
      .addField("Event:", event.type, true)
      .addField("Max. Attendance:", event.maxAttendance, false)
      .addField("Date:", event.date.toLocaleDateString("en-GB"), true)
      .addField("Time:", `${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}`, true)
      .addField("Details:", event.content, false)
      .setColor(event.mandatory === "yes" ? "#ff0000" : "#58de49")
      .setFooter(event.mandatory === "yes" ? "Mandatory" : "Non-mandatory")

    const reactionMessage = await message.channel.send(embed);

    let emojis = [config.editEmoji, config.deleteEmoji];

    if (event.date > Date.now()) {
      await reactionMessage.react(config.editEmoji);
    }
    await reactionMessage.react(config.deleteEmoji);


    const filter = (reaction, user) => {
      if (!emojis.includes(reaction.emoji.name)) {
        let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.name);
        reactionMap?.users.remove(user.id);
      };
      return emojis.includes(reaction.emoji.name);
    };

    const collector = reactionMessage.createReactionCollector(filter, { max: 1, dispose: true });
    collector.on('collect', async (reaction, user) => {

      switch (reaction.emoji.name) {
        case config.deleteEmoji: {
          deleteEvent(message, event, guildConfig)
          break;
        };
        case config.editEmoji: {
          if (event.date < Date.now()) {
            message.channel.send("You can't edit events that already took place.")
            break;
          }
          editEvent(message, event, guildConfig);
          break;
        };
      };
    });

  })
};

module.exports.help = {
  name: "events",
  description: ""
};

/*
?events
lists every active event in the guild as an embed message
reaction icons for:
 - delete
 - edit
 - maybe attendance

*/