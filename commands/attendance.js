const Discord = require("discord.js");
const Event = require('../db/eventSchema');
const guildConfig = require('../guild-config')

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
        arr.push(`<@${user.id}>`);
      };
    };
    if (!arr.length) arr = "No reactions"
    return arr;
  }

  let yesUsersArray = createArrayOfUsersOutOfMap(yesUsersMap);
  let noUsersArray = createArrayOfUsersOutOfMap(noUsersMap);

  const sendMessageWithAttendanceForReaction = async (reaction, array) => {
    message.channel.send(`Here are the people that reacted with ${reaction}:`);
    //const embed = new Discord.MessageEmbed().setDescription(array);
    await message.channel.send(array, { "allowedMentions": { "users": [] } });
  }

  await sendMessageWithAttendanceForReaction("YES", yesUsersArray)
  await sendMessageWithAttendanceForReaction("NO", noUsersArray)


  // Save all users to cache
  await message.channel.guild.members.fetch()

  // Get Member role
  const memberRole = message.channel.guild.roles.cache.find(role => role.name === guildConfig.memberRole);

  // Get all members with Member role
  const members = memberRole.members // <- map of users with member role

  // Create an array of users that didnt react to anything

  const yesArray = Array.from(yesUsersMap)
  const noArray = Array.from(noUsersMap)
  const membersArray = Array.from(members)
  let toRemove = yesArray.concat(noArray)
  let undecidedArray = membersArray.filter(ar => !toRemove.find(rm => rm[0] === ar[0]))

  let arrUndec = []
  undecidedArray.forEach(item => {
    arrUndec.push(`<@${item[0]}>`)
  })

  if (!arrUndec.length) arrUndec = "Good job! No undecided people today."

  await sendMessageWithAttendanceForReaction("NO REACTION", arrUndec)
}

module.exports.help = {
  name: "attendance",
  description: "check attendance on events"
};





