const Discord = require("discord.js");
const Event = require('../db/eventSchema');

module.exports.run = async (bot, message, args) => {
  let type = args[0] || "node";
  let date = args[1] || "02-02-2021";
  let maxAttendance = args[2] || null;

  message.delete({ timeout: 4000 });

  // SEND THE MESSAGE WITH REACTION ICONS
  const embed = new Discord.MessageEmbed().setDescription(`EVENT: ${type} #NW02022021\nDATE: 02.02.2021 20:00`);
  let messageId
  const reactionMessage = await message.channel.send(embed).then(sent => {
    messageId = sent.id;
    return sent;
  }).catch(console.log);

  await reactionMessage.react("➕");
  await reactionMessage.react("➖");


  const doc = await Event.create({
    type,
    date: new Date(date),
    maxAttendance,
    messageId
  });
};

module.exports.help = {
  name: "event",
  description: "set new event"
};
