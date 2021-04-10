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
  const yesUsersMap = await yes.users.fetch();
  const noUsersMap = await no.users.fetch();

  const createArrayOfUsersOutOfMap = (map) => {
    let arr = []
    for (let item of map.keys()) {
      let user = map.get(item);
      if (!user.bot) {
        arr.push(user.username);
      };
    };
    if (!arr.length) arr = "No reactions"
    return arr;
  }

  let yesUsersArray = createArrayOfUsersOutOfMap(yesUsersMap);
  let noUsersArray = createArrayOfUsersOutOfMap(noUsersMap);

  const sendMessageWithAttendanceForReaction = async (reaction, array) => {
    message.channel.send(`Here are the people that reacted with ${reaction}:`);
    const embed = new Discord.MessageEmbed().setDescription(array);
    const responseMessage = await message.channel.send(embed);
  }

  await sendMessageWithAttendanceForReaction("YES", yesUsersArray)
  await sendMessageWithAttendanceForReaction("NO", noUsersArray)
}

module.exports.help = {
  name: "attendance",
  description: "check attendance on events"
};