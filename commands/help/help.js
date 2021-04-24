const Discord = require("discord.js");
const fs = require("fs");
const sendEmbedMessage = require("../../utils/sendEmbedMessage")

module.exports.run = async (bot, message, args) => {

  message.channel.send("Available commands: \n");

  fs.readdir("./commands/", async (err, files) => {
    if (err) console.error(err);

    if (files.length <= 0) {
      console.log("Couldn't find commands.");
      return;
    };

    let results = files.map((f) => {
      let props = require(`../${f}/${f}.js`);
      return {
        name: props.help.name || '',
        description: props.help.description || '',
        usage: props.help.usage || ''
      };
    });

    let commandsArray = [];
    results.forEach(item => {
      commandsArray.push(`**${item.name}** \n${item.description} \n${item.usage}`);
    });

    await sendEmbedMessage(message.channel, "Available commands:", commandsArray)
  });
};

module.exports.help = {
  name: "help",
  description: "displays list of available commands",
  usage: ""
};