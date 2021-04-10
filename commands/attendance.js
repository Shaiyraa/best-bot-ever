const Discord = require("discord.js");
const Event = require('../db/eventSchema');

module.exports.run = async (bot, message, args) => {
  const date = args[0];
  const eventArray = await Event.find({ date });

  if (!eventArray.length) {
    message.channel.send("No events matching the parameters.");
    return;
  }

  const eventId = eventArray[0].messageId;
  // fetch the message and get reactions
  const event = await message.channel.messages.fetch(eventId);

  const yes = await event.reactions.resolve("➕");
  const no = await event.reactions.resolve("➖");

  // get collection of users that reacted
  const yesUsers = await yes.users.fetch();
  const noUsers = await no.users.fetch();

  let yesUsersArray = [];
  for (let item of yesUsers.keys()) {
    let user = yesUsers.get(item);
    if (!user.bot) {
      yesUsersArray.push(user.username);
    }
  };

  let noUsersArray = []
  for (let item of noUsers.keys()) {
    let user = noUsers.get(item);
    if (!user.bot) {
      noUsersArray.push(user.username);
    }
  };

  if (!yesUsersArray.length) yesUsersArray = "No reactions"
  message.channel.send("Here are the people that reacted with YES:");
  const embedYes = new Discord.MessageEmbed().setDescription(yesUsersArray);
  const responseMessageYes = await message.channel.send(embedYes);

  if (!noUsersArray.length) noUsersArray = "No reactions"
  message.channel.send("Here are the people that reacted with NO:");
  const embedNo = new Discord.MessageEmbed().setDescription(noUsersArray);
  const responseMessageNo = await message.channel.send(embedNo);

}

module.exports.help = {
  name: "attendance",
  description: "check attendance on events"
};