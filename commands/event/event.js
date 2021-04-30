const Discord = require("discord.js");
const schedule = require('node-schedule');
const config = require("../../config.json");

const Event = require("../../db/eventSchema");
const Job = require("../../db/jobSchema");

const isGuildConfigInDB = require("../../utils/isGuildConfigInDB");
const validateResponseRegex = require("../../utils/validateResponseRegex");
const validateResponse = require("../../utils/validateResponse");
const getArrayOfUsers = require("../../utils/getArrayOfUsers");
const tagUsersWithMessage = require("../../utils/tagUsersWithMessage");


module.exports.run = async (bot, message, args) => {

  // CHECK IF GUILD IS IN DB
  const guildConfig = await isGuildConfigInDB(message.guild.id);
  if (!guildConfig) {
    message.channel.send("Server config doesn't exist. Try ?config or ?help to get more info.");
    return;
  };

  const reachedDailyLimit = async () => {

    // check if there are already 3 events this day for this guild
    let dateThisDay = new Date(params[0].getFullYear(), params[0].getMonth(), params[0].getDate());
    let dateNextDay = new Date(dateThisDay);
    dateNextDay.setDate(dateNextDay.getDate() + 1);

    let events = await Event.find({ date: { $gte: dateThisDay, $lte: dateNextDay }, active: true });
    events = events.filter(event => event.guild.id === guildConfig.id);

    if (events.length >= 3) {
      message.channel.send("You reached limit of 3 events per day.");
      return true;
    };
    return false;
  };

  const isAlreadyCreated = async () => {

    let events = await Event.find({ date: params[0], active: true });
    events = events.filter(event => event.guild.id === guildConfig.id);

    if (events.length) {
      message.channel.send("There's already an event scheduled for this time and date.");
      return true;
    };
    return false;
  };

  let params = [];

  if (args.length > 0) {
    if (!args[0].match(/^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)) {
      message.channel.send("Invalid date (correct format: ?event dd-mm-yyyy).");
      return;
    };

    params[0] = args[0];
    params[1] = args[1] || "20:00";

    params[0] = new Date(params[0].split(/\D/g)[2], params[0].split(/\D/g)[1] - 1, params[0].split(/\D/g)[0], params[1].split(":")[0], params[1].split(":")[1]);
    const alreadyCreated = await isAlreadyCreated();
    if (alreadyCreated) return;
    const reachedLimit = await reachedDailyLimit();
    if (reachedLimit) return;

    params[2] = args[2] || "nodewar";
    params[3] = parseInt(args[3], 10) || 100;
    params[4] = args[4] || "yes";
    params[5] = args[5] || "yes";

  } else {

    // ask for date
    message.channel.send("What is the date of the event?");
    params[0] = await validateResponseRegex(message, "Invalid date format", /^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g);
    if (params[0] === "exit") return;

    // ask for hour
    message.channel.send('What time is the event?');
    params[1] = await validateResponseRegex(message, "Invalid time.", /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g);
    if (params[1] === "exit") return;

    params[0] = new Date(params[0].split(/\D/g)[2], params[0].split(/\D/g)[1] - 1, params[0].split(/\D/g)[0], params[1].split(":")[0], params[1].split(":")[1]);
    const alreadyCreated = await isAlreadyCreated();
    if (alreadyCreated) return;
    const reachedLimit = await reachedDailyLimit();
    if (reachedLimit) return;

    // ask for type
    message.channel.send('What is the type of the event? Possible types: "nodewar", "siege", "guildevent".');
    params[2] = await validateResponse(message, "Invalid response (nodewar, siege, guildevent)", ['nodewar', 'siege', 'guildevent']);
    if (params[2] === "exit") return;

    // ask for maxAttendance
    message.channel.send("What is the max attendance of the event?");
    params[3] = await validateResponseRegex(message, "Invalid answer (1-100).", /^0*(?:[1-9][0-9]?|100)$/g);
    if (params[3] === "exit") return;

    // ask for mandatory
    message.channel.send("Is the event mandatory?");
    params[4] = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"]);
    if (params[4] === "exit") return;

    // ask for alerts
    message.channel.send("Do you want to enable automatic alerts?");
    params[5] = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"]);
    if (params[5] === "exit") return;
  };

  // ask for content
  let content = "no description";
  message.channel.send("Do you want to create a custom message (yes/no)?");
  const contentResponse = await validateResponse(message, "Invalid answer (yes/no).", ["yes", "no"]);

  switch (contentResponse) {
    case "exit": {
      return
    };
    case "yes": {
      message.channel.send("Type in the content:")
      const filter = m => m.author.id === message.author.id;
      await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
        .then(m => {
          m = m.first();
          content = m.content.toLowerCase();
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  // SEND THE MESSAGE WITH REACTION ICONS
  const embed = new Discord.MessageEmbed()
    .addField("Event:", params[2], false)
    .setDescription(params[4] === "yes" ? "Mandatory" : "Non-mandatory")
    .addField("Date:", params[0].toLocaleDateString("en-GB"), true)
    .addField("Time:", params[1], true)
    .addField("Max. Attendance:", params[3], false)
    .addField("Details:", content, false)
    .setColor(params[4] === "yes" ? "#ff0000" : "#58de49");


  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel);
  const reactionMessage = await channel.send(embed).catch(console.log);

  const messageId = reactionMessage.id;

  let emojis = [config.yesEmoji, config.noEmoji];

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

  const collector = reactionMessage.createReactionCollector(filter2, { dispose: true });
  collector.on('collect', (reaction, user) => {

    switch (reaction.emoji.name) {
      case config.yesEmoji: {
        // remove reaction if list is full
        let yesReactionMap = reactionMessage.reactions.resolve(config.yesEmoji)

        if (yesReactionMap.count > params[3] + 1) {
          user.send("The list is full.")
          yesReactionMap.users.remove(user.id)
          break;
        }

        // disable multiple options
        let noReactionMap = reactionMessage.reactions.resolve(config.noEmoji);

        if (noReactionMap.users.cache.get(user.id)) {
          noReactionMap.users.remove(user.id);
        };

        break;
      };
      case config.noEmoji: {
        let reactionMap = reactionMessage.reactions.resolve(config.yesEmoji);

        if (reactionMap.users.cache.get(user.id)) {
          reactionMap.users.remove(user.id);
        };
        break;
      };
    };
  });

  // CREATE EVENT DOCUMENT 

  const doc = await Event.create({
    date: params[0],
    type: params[2],
    maxAttendance: params[3],
    mandatory: params[4],
    alerts: params[5],
    content,
    messageId,
    guild: guildConfig._id
  });


  // CREATE ALERTS 

  // alert for undecided 2 hours before event
  let tagUndecided = new Date(params[0]);
  tagUndecided.setHours(tagUndecided.getHours() - 2);

  await Job.create({
    event: doc._id,
    date: tagUndecided
  });

  // alert for reminding yes people to prepare
  let tagYes = new Date(params[0]);
  tagYes.setHours(tagYes.getHours() - 1);

  await Job.create({
    event: doc._id,
    date: tagYes
  });

  // alert for yes people to get in voice chat
  let tagYesVoice = new Date(params[0]);
  tagYesVoice.setMinutes(tagYesVoice.getMinutes() - 15);

  await Job.create({
    event: doc._id,
    date: tagYesVoice
  });

  if (params[5] === "yes") {
    schedule.scheduleJob(tagUndecided, async function () {
      let usersArray = await getArrayOfUsers(config.undecidedEmoji, reactionMessage);
      if (!usersArray.length) return;
      await tagUsersWithMessage(message.guild, "There's an event starting in 2 hours! Let your officers know if you're gonna be there.", `[Link to the event](${reactionMessage.url})`, usersArray, guildConfig);
    });

    schedule.scheduleJob(tagYes, async function () {
      let usersArray = await getArrayOfUsers(config.yesEmoji, reactionMessage);
      if (!usersArray.length) return;
      await tagUsersWithMessage(message.guild, "There's an event starting in 1 hour! Time to buff up and prepare.", `[Link to the event](${reactionMessage.url})`, usersArray, guildConfig);
    });

    schedule.scheduleJob(tagYesVoice, async function () {
      let usersArray = await getArrayOfUsers(config.yesEmoji, reactionMessage);
      if (!usersArray.length) return;
      await tagUsersWithMessage(message.guild, "Get in voice chat, the event starts in 15 minutes!", `[Link to the event](${reactionMessage.url})`, usersArray, guildConfig);
    });
  };

  await Job.create({
    event: doc._id,
    date: params[0]
  });

  // set event to active: false after it ends
  schedule.scheduleJob(params[0], async function () {
    doc.active = false
    await doc.save()
  });

};


module.exports.help = {
  name: "event",
  description: "set new event"
};

