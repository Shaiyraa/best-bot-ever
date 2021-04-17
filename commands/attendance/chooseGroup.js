const sendEmbedMessage = require("../../utils/sendEmbedMessage");
const chooseAction = require("./chooseAction");
const guildConfig = require("../../guild-config");

module.exports = async (message, eventId) => {
  const reactionMessage = await sendEmbedMessage(message, "Choose group of people you wanna see:", "✅ - Yes\n❌ - No\n❔ - Undecided\n🌐 - Show all three groups");
  await reactionMessage.react("✅");
  await reactionMessage.react("❌");
  await reactionMessage.react("❔");
  await reactionMessage.react("🌐");

  const channel = await message.guild.channels.resolve(guildConfig.announcementsChannel)
  const event = await channel.messages.fetch(eventId)

  if (!event) {
    message.channel.send("Event message doesn't exist anymore.");
    return;
  }

  const createGroupArray = async (reaction) => {

    // resolve reaction
    const r = await event.reactions.resolve(reaction);
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

    return usersArray;
  };

  const respondWithReactionGroup = async (reaction, usersArray) => {
    if (!usersArray.length) usersArray = "No users";
    return await sendEmbedMessage(message, `Here are the people that reacted with ${reaction}:`, usersArray);
  };

  const respondWithUndecided = async (yesUsersArray, noUsersArray) => {

    // get users with member role and create an array of their IDs
    await message.channel.guild.members.fetch();
    const memberRole = message.channel.guild.roles.cache.find(role => role.name === guildConfig.memberRole);
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

    return await sendEmbedMessage(message, `Here are the people that didn't react at all:`, undecidedArray);
  };

  // CREATE COLLECTOR
  const filter = (reaction, user) => {
    let emojis = ["✅", "❌", "❔", "🌐"];
    return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  };

  const collector = reactionMessage.createReactionCollector(filter, { max: 1, time: 30000, dispose: true });
  collector.on('collect', async (reaction, user) => {

    // YES or NO
    if (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") {

      const usersArray = await createGroupArray(reaction.emoji.name);
      const reactionGroupMessage = await respondWithReactionGroup(reaction.emoji.name, usersArray);
      chooseAction(message, event, reactionGroupMessage);

    };

    // UNDECIDED
    if (reaction.emoji.name === "❔") {

      const yesUsersArray = await createGroupArray("✅");
      const noUsersArray = await createGroupArray("❌");
      const reactionGroupMessage = await respondWithUndecided(yesUsersArray, noUsersArray);
      chooseAction(message, event, reactionGroupMessage);

    };

    // ALL
    if (reaction.emoji.name === "🌐") {

      const yesUsersArray = await createGroupArray("✅");
      const yesGroupMessage = await respondWithReactionGroup("✅", yesUsersArray);
      chooseAction(message, event, yesGroupMessage);

      const noUsersArray = await createGroupArray("❌");
      const noGroupMessage = await respondWithReactionGroup("❌", noUsersArray);
      chooseAction(message, event, noGroupMessage);

      const undecidedGroupMessage = await respondWithUndecided(yesUsersArray, noUsersArray);
      chooseAction(message, event, undecidedGroupMessage);

    };
  });
};


