const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  const rolesNames = [...args];

  // GET EMOJIS AND MATCHING ROLES
  if (!rolesNames.length) return message.channel.send("Provide names of roles you want to have reactions set up for!");
  let error = false;
  const emojis = rolesNames.map(item => {
    let res = message.guild.emojis.cache.find(emoji => emoji.name === item);

    if (!res) {
      error = true;
      return message.channel.send("At least one emoji for provided roles doesn't exist. Make sure the emoji name matches the role name.");
    }

    return res;
  })
  if (error) return;

  const roles = rolesNames.map(item => {
    let res = message.member.guild.roles.cache.find(role => role.name === item);

    if (!res) {
      error = true;
      return message.channel.send("At least one of provided roles doesn't exist on the server.");
    }

    return res;
  })
  if (error) return;

  // SEND THE MESSAGE WITH REACTION ICONS
  const embed = new Discord.MessageEmbed().setDescription(`Choose a role to see related channels:`);
  const reactionMessage = await message.channel.send(embed);

  for (let item of emojis) {
    await reactionMessage.react(item);
  };

  // CREATE COLLECTOR - listen for reactions
  const filter = (reaction, user) => {
    return emojis.includes(reaction.emoji);
  };

  const collector = reactionMessage.createReactionCollector(filter, { dispose: true });
  collector.on('collect', (reaction, user) => {

    // find reaction's author
    const member = message.member.guild.members.cache.find(mem => mem.id === user.id);

    // loop through emojis to see which one was clicked and add matching role to member
    for (let i = 0; i <= emojis.length - 1; i++) {
      if (emojis[i].id === reaction.emoji.id) {
        member.roles.add(roles[i])
          .catch(console.log);
      };
    };
  });

  collector.on('remove', (reaction, user) => {
    // find reaction's author
    const member = message.member.guild.members.cache.find(mem => mem.id === user.id);

    // remove role
    for (let i = 0; i < emojis.length - 1; i++) {
      if (emojis[i].id === reaction.emoji.id) {
        member.roles.remove(roles[i])
          .catch(console.log);
      };
    };
  });
};

module.exports.help = {
  name: "roles",
  description: "takes case-sensitive names of roles separated by space; for example: ?roles BlackDesertOnline Valorant",
  usage: "reaction roles"
};