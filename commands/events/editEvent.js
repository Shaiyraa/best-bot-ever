const Discord = require("discord.js");
const schedule = require('node-schedule');
const config = require("../../config.json");
const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const validateResponse = require("../../utils/validateResponse");
const validateResponseRegex = require("../../utils/validateResponseRegex");
const getArrayOfUsers = require("../../utils/getArrayOfUsers");
const tagUsersWithMessage = require("../../utils/tagUsersWithMessage");

module.exports = async (message, event, guildConfig) => {
  const embed = new Discord.MessageEmbed()
    .setTitle("What do you want to edit?")
    .addField(`${config.typeEmoji} Event`, event.type, true)
    .addField(`${config.attendanceEmoji} Max. Attendance:`, event.maxAttendance, false)
    .addField(`${config.dateEmoji} Date:`, event.date.toLocaleDateString("en-GB"), true)
    .addField(`${config.hourEmoji} Time:`, `${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}`, true)
    .addField(`${config.contentEmoji} Details:`, event.content, false)
    .addField(`${config.alertsEmoji} Alerts`, event.alerts, true)
    .addField(`${config.mandatoryEmoji}Is mandatory`, event.mandatory, true)
    .setColor("#fced5d");
  const reactionMessage = await message.channel.send(embed);

  const emojis = [config.typeEmoji, config.attendanceEmoji, config.dateEmoji, config.hourEmoji, config.contentEmoji, config.alertsEmoji, config.mandatoryEmoji];
  for (item of emojis) {
    await reactionMessage.react(item);
  };


  // CREATE LISTENER 
  const filter2 = (reaction, user) => {
    if (!emojis.includes(reaction.emoji.name)) {
      let reactionMap = reactionMessage.reactions.resolve(reaction.emoji.name);
      reactionMap?.users.remove(user.id);
    };
    return emojis.includes(reaction.emoji.name);
  };

  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
  let eventMessage = await channel.messages.fetch(event.messageId);

  const collector = reactionMessage.createReactionCollector(filter2, { max: 1, dispose: true });
  collector.on('collect', async (reaction, user) => {

    switch (reaction.emoji.name) {
      case config.typeEmoji: {

        message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent".');
        type = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ['nodewar', 'siege', 'guildevent']);
        if (type === "exit") {
          message.channel.send("Bye!");
          return;
        };

        if (event.type !== type) {
          event.type = type;
        };

        message.channel.send(`Set event type to ${event.type}.`);
        break;
      };
      case config.attendanceEmoji: {

        message.channel.send("What is the max attendance of the event?");
        maxAttendance = await validateResponseRegex(message, "Invalid answer (1-100).", /^0*(?:[1-9][0-9]?|100)$/g);
        if (maxAttendance === "exit") {
          message.channel.send("Bye!");
          return;
        };

        if (event.maxAttendance !== maxAttendance) {
          event.maxAttendance = maxAttendance;
        };
        message.channel.send(`Set max. attendance to ${event.maxAttendance}.`);

        break;
      };
      case config.dateEmoji: {

        message.channel.send("What is the date of the event?");
        let date = await validateResponseRegex(message, "Invalid date format", /^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g);
        if (date === "exit") {
          message.channel.send("Bye!");
          return;
        };

        // create a new Date 
        let hours = event.date.getHours();
        let minutes = event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes();
        date = new Date(date.split(/\D/g)[2], date.split(/\D/g)[1] - 1, date.split(/\D/g)[0], hours, minutes);

        if (event.date !== date) {
          event.date = date;
        };
        message.channel.send(`Set event date to ${event.date.toLocaleDateString("en-GB")} ${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}.`);
        break;
      };
      case config.hourEmoji: {

        message.channel.send('What time is the event?');
        time = await validateResponseRegex(message, "Invalid time.", /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g);
        if (time === "exit") {
          message.channel.send("Bye!");
          return;
        };

        let date = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), time.split(":")[0], time.split(":")[1]);
        if (event.date !== date) {
          event.date = date;
        };

        message.channel.send(`Set event date to ${event.date.toLocaleDateString("en-GB")} ${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}.`);

        break;
      };
      case config.contentEmoji: {

        let content = "no description";

        message.channel.send("Type in the content:");
        const filter = m => m.author.id === message.author.id;
        await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
          .then(m => {
            m = m.first();
            content = m.content.toLowerCase();
          })
          .catch((err) => {
            console.log(err);
          });

        if (content === "exit") {
          message.channel.send("Bye!");
          return;
        };

        if (event.content !== content) {
          event.content = content;
        };

        message.channel.send("Content updated.");
        break;
      };
      case config.alertsEmoji: {
        if (event.alerts === "yes") {
          event.alerts = "no";
        } else {
          event.alerts = "yes";

          // schedule jobs
          let tagUndecided = new Date(event.date);
          tagUndecided.setHours(tagUndecided.getHours() - 2);

          let tagYes = new Date(event.date);
          tagYes.setHours(tagYes.getHours() - 1);

          let tagYesVoice = new Date(event.date);
          tagYesVoice.setMinutes(tagYesVoice.getMinutes() - 15);

          schedule.scheduleJob(tagUndecided, async function () {
            let usersArray = await getArrayOfUsers(config.undecidedEmoji, eventMessage);
            if (!usersArray.length) return;
            await tagUsersWithMessage(message.guild, "There's an event starting in 2 hours! Let your officers know if you're gonna be there.", `[Link to the event](${eventMessage.url})`, usersArray, guildConfig);
          });

          schedule.scheduleJob(tagYes, async function () {
            let usersArray = await getArrayOfUsers(config.yesEmoji, eventMessage);
            if (!usersArray.length) return;
            await tagUsersWithMessage(message.guild, "There's an event starting in 1 hour! Time to buff up and prepare.", `[Link to the event](${eventMessage.url})`, usersArray, guildConfig);
          });

          schedule.scheduleJob(tagYesVoice, async function () {
            let usersArray = await getArrayOfUsers(config.yesEmoji, eventMessage);
            if (!usersArray.length) return;
            await tagUsersWithMessage(message.guild, "Get in voice chat, the event starts in 15 minutes!", `[Link to the event](${eventMessage.url})`, usersArray, guildConfig);
          });
        };

        message.channel.send(`Alerts are now set to ${event.alerts}.`);
        break;
      };
      case config.mandatoryEmoji: {
        event.mandatory = !event.mandatory;
        message.channel.send(`Is event mandatory: ${event.mandatory}.`);
        break;
      };
    };
    await event.save();

    // create a new embed
    const newEmbed = new Discord.MessageEmbed()
      .addField("Event:", event.type, true)
      .addField("Max. Attendance:", event.maxAttendance, false)
      .addField("Date:", event.date.toLocaleDateString("en-GB"), true)
      .addField("Time:", `${event.date.getHours()}:${event.date.getMinutes() < 10 ? '0' + event.date.getMinutes() : event.date.getMinutes()}`, true)
      .addField("Details:", event.content, false)
      .setColor(event.mandatory === true ? "#ff0000" : "#58de49")
      .setFooter(event.mandatory === true ? "Mandatory" : "Non-mandatory");

    // replace old one
    eventMessage.edit(newEmbed);
  });
};