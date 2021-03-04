const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  message.channel.send('Hello!');
}

module.exports.help = {
  name: "greet",
  description: "if you feel lonely, I can always say say hello to you"
}