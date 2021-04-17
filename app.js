const config = require("./config.json");
const token = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require('mongoose');
const app = require('./app');

const db = process.env.MONGO_URI || "mongodb://test:test@localhost:27017/bestbot"
mongoose.connect(db, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(connection => {
  console.log("Connection to db established.")
}).catch(err => {
  console.log(err)
  console.log("Cannot connect to db.")
})

// create bot
const bot = new Discord.Client({ disableEveryone: true });

// create commands
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  if (files.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  };

  files.forEach((command) => {
    //let props = require(`./commands/${command}`);
    let props = require(`./commands/${command}/${command}.js`);
    //console.log(`${command} loaded!`);
    bot.commands.set(props.help.name, props);
    //console.log(props.help);
  });


});

// bot.on('guildMemberAdd', member => {
//   console.log('User' + member.user.tag + 'has joined the server!');
// })

// bot.on('guildMemberRemove', member => {
//   console.log('User' + member.user.tag + 'has left the server!');
// })


//Command Manager
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  //Check for prefix
  if (!cmd.startsWith(config.prefix)) return;

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(bot, message, args);

});

bot.login(token.token);


// TODO:
// delete command messages after responding to them
// make a command for notices @training @nodewar etc