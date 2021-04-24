const Guild = require("../db/guildSchema");

const createGroupArray = async (reaction, eventMessage) => {
  // resolve reaction
  const r = await eventMessage.reactions.resolve(reaction);
  if (!r) {
    message.channel.send("Something went wrong.");
    return;
  };

  // fetch users who reacted
  const usersMap = await r.users.fetch();

  // create an array of user IDs out of users map
  let usersArray = [];
  for (let item of usersMap.keys()) {
    let user = usersMap.get(item);
    if (!user.bot) {
      usersArray.push(`<@${user.id}>`);
    };
  };
  if (!usersArray.length) usersArray = "No users";
  return usersArray;
};

const getArrayOfUsers = async (reaction, eventMessage) => {
  if (reaction === "✅") {
    return await createGroupArray("✅", eventMessage)

  } else if (reaction === "❌") {
    return await createGroupArray("❌", eventMessage)

  } else if (reaction === "❔") {
    const yesUsersArray = await createGroupArray("✅", eventMessage)
    const noUsersArray = await createGroupArray("❌", eventMessage)

    const guild = await Guild.findOne({ id: eventMessage.guild.id })
    await eventMessage.guild.members.fetch();
    const memberRole = eventMessage.channel.guild.roles.cache.find(role => role.id === guild.memberRole)

    const membersMap = memberRole.members;

    let membersArray = [];
    for (let item of membersMap.keys()) {
      let user = membersMap.get(item);
      if (!user.bot) {
        membersArray.push(`<@${user.id}>`);
      };
    };

    // separate users who didnt react
    let toRemove = yesUsersArray.concat(noUsersArray);
    let undecidedArray = membersArray.filter(ar => !toRemove.find(rm => rm === ar));
    if (!undecidedArray.length) undecidedArray = "No users";

    return undecidedArray
  }
}
module.exports = getArrayOfUsers