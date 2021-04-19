const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  message.channel.send('Hello!');
};

module.exports.help = {
  name: "config",
  description: "Config command for GM and officers to set up stuff so other commands work properly"
};



/*
Config command for gm and officers to set up stuff so other commands work properly

?config [config item] [value]

Parameters:
- memberRole
- announcementsChannel
- remindersChannel
- commandsChannel
and more coming probably

cases:
  - command has no params: ask for values for every config param
  - command has 1 param: ask for value
  - command has 2 params

check if param exist and find id for provided value, then insert the ids to guild document:
  - if guild document doesnt exist in db, create one and insert the ids
  - if it exists, just insert the ids

*/