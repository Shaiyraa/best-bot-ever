const Discord = require("discord.js")
const fs = require("fs")

module.exports.run = async (bot, message, args) => {
  message.channel.send("Available commands: \n")
  
  fs.readdir("./commands/", (err, files) => {
    if(err) console.error(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if(jsfile.length <= 0){
      console.log("Couldn't find commands.");
      return;
    }

    let results = jsfile.map((f) => {
        let props = require(`./${f}`);
        return {
          name: props.help.name || '',
          description: props.help.description || '',
          usage: props.help.usage || ''
        }
    });

    results.forEach(item => {
      message.channel.send(`**${item.name}** \n${item.description} \n${item.usage}`);
    })
  });
}

module.exports.help = {
  name: "help",
  description: "displays list of available commands",
  usage: ""
}