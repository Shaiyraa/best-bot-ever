const Discord = require("discord.js");
const isGuildConfigInDB = require("../../utils/isGuildConfigInDB")
const Event = require("../../db/eventSchema");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const config = require("../../config.json");
const editEvent = require("./editEvent");
const deleteEvent = require("./deleteEvent");
const isAuthorOfficer = require("../../utils/isAuthorOfficer")

module.exports.run = async (bot, message, args) => {

  const guildConfig = await isGuildConfigInDB(message.guild.id)
  if (!guildConfig) {
    message.channel.send("Server config doesn't exist. Try ?config or ?help to get more info.");
    return;
  }
  const isOfficer = await isAuthorOfficer(message, guildConfig)
  if (!isOfficer) {
    message.channel.send(`Only <@&${guildConfig.officerRole}> can user this command.`, {
      "allowedMentions": { "users": [] }
    });
    return;
  };

  let events = await Event.find({ active: true, date: { $gt: Date.now() } }).sort({ date: 1 })
  events = events.filter(event => event.guild.id === guildConfig.id)

  if (!events.length) message.channel.send("There are no scheduled events.")

  events.forEach(async event => {
    const embed = new Discord.MessageEmbed()
      .addField("Event:", event.type, true)
      .addField("Max. Attendance:", event.maxAttendance, false)
      .addField("Date:", event.date.toLocaleDateString("en-GB"), true)
      .addField("Time:", `${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}`, true)
      .addField("Details:", event.content, false)
      .setColor(event.mandatory === true ? "#ff0000" : "#58de49")
      .setFooter(event.mandatory === true ? "Mandatory" : "Non-mandatory")

    const reactionMessage = await message.channel.send(embed);

    let emojis = [config.editEmoji, config.deleteEmoji];

    await reactionMessage.react(config.editEmoji);
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
          await deleteEvent(message, event, guildConfig)
          message.channel.send("Event has been deleted.")
          break;
        };
        case config.editEmoji: {
          await editEvent(message, event, guildConfig);
          break;
        };
      };
    });

  })
};

module.exports.help = {
  name: "events",
  description: "?events \nto look up scheduled events, edit and delete them"
};

/*
?events
lists every active event in the guild as an embed message
reaction icons for:
 - delete
 - edit
 - maybe attendance

*/