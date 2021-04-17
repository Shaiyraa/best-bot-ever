const Discord = require("discord.js");
const Event = require('../../db/eventSchema');
const guildConfig = require("../../guild-config");

module.exports.run = async (bot, message, args) => {
  let type = args[0] || "node war";
  let date = args[1] || "06-02-2021";
  let hour = args[2] || "20:00";
  let alerts = args[3] || "true";
  let maxAttendance = args[4] || null;

  message.delete({ timeout: 4000 });

  // SEND THE MESSAGE WITH REACTION ICONS
  const embed = new Discord.MessageEmbed().setDescription(`EVENT: ${type}\nDATE: 02.02.2021 20:00`);
  let messageId;
  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel)
  const reactionMessage = await channel.send(embed).then(sent => {
    messageId = sent.id;
    return sent;
  }).catch(console.log);

  await reactionMessage.react("✅");
  await reactionMessage.react("❌");


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

