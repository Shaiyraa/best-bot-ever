const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  message.channel.send('Hello!');
}

module.exports.help = {
  name: "greet",
  description: "if you feel lonely, I can always say say hello to you"
}

// !attendance 23.23.23

// const events = {
//   [{
//     id: "234234235235"
//     type: "nw",
//     date: '23.23.23'
//   }],
//   [event2],
//   [event3]
// }