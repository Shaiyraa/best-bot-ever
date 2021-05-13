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
        description: props.help.description || ''
      };
    });

    let commandsArray = [];
    results.forEach(item => {
      commandsArray.push(`\n**${item.name}** \n${item.description}`);
    });
    commandsArray.push("\nwhen you want to exit a command at any point, type **exit**");
    await sendEmbedMessage(message.channel, "Available commands:", commandsArray)
  });
};

module.exports.help = {
  name: "help",
  description: "?help \nto display the list of available commands"
};