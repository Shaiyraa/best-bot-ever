const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })
const config = require("./config.json");
const token = require("./token.json");

const scheduleJobsInDB = require("./scheduleJobsInDB");
const setListenersForEventMessages = require("./setListenersForEventMessages");

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

bot.on("ready", () => {
  bot.user.setActivity('type ?help', { type: 'PLAYING' })
  //bot.user.setActivity('Type ?help', { type: 'CUSTOM_STATUS' })


})
scheduleJobsInDB(bot).catch(console.log)
setListenersForEventMessages(bot).catch(console.log)


// create commands
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  if (files.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  };

  files.forEach((command) => {
    let props = require(`./commands/${command}/${command}.js`);
    bot.commands.set(props.help.name, props);
  });
});

let talkedRecently = new Set();
const talkedRecentlyAdd = (user) => {
  // Adds the user to the set so that they can't talk for a minute
  talkedRecently.add(user.id);
  setTimeout(() => {
    // Removes the user from the set after a minute
    talkedRecently.delete(user.id);
  }, 5000);
}

//Command Manager
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  if (message.content?.toLowerCase() === "good bot") {
    message.channel.send("^^");
    return;
  }
  let prefix = config.prefix;

  //Check for prefix
  if (!message.content.startsWith(prefix)) {
    return;
  }

  if (talkedRecently.has(message.author.id)) {
    message.channel.send("You need to wait 5 seconds to type a command again.")
    return;
  }

  talkedRecentlyAdd(message.author)

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) {
    await commandfile.run(bot, message, args);
  } else {
    message.channel.send("I don't recognize this command.")
  }
});


bot.login(token.token)







// bot.on('guildMemberAdd', member => {
//   console.log('User' + member.user.tag + 'has joined the server!');
// })

// bot.on('guildMemberRemove', member => {
//   console.log('User' + member.user.tag + 'has left the server!');
// })