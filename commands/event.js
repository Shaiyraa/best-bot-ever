const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  let type = args[0] || "node";
  //let date = args[1];
  message.delete({ timeout: 4000 });

  message.channel.send(`EVENT: ${type} #NW02022021\nDATE: 02.02.2021 20:00`)
}

module.exports.help = {
  name: "event",
  description: "set new event"
}
