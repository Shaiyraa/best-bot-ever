const config = require("./config.json");
const token = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require('mongoose');
const winston = require('winston');
const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

// TODO:
// delete command messages after responding to them
// make a command for notices @training @nodewar etc

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

fs.readdir("./commands/", (err, files) => {

  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if (jsfile.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((command) => {
    let props = require(`./commands/${command}`);
    //console.log(`${command} loaded!`);
    bot.commands.set(props.help.name, props);
    //console.log(props.help);
  });


});
// //Add Role And Welcome New Member
// bot.on('guildMemberAdd', member => {
//   console.log('User' + member.user.tag + 'has joined the server!');

//   var role = member.guild.roles.find('name', 'Member');

//   client.channels.find("name", "welcome").send('Welcome '+ member.username)

//   setTimeout(function(){
//   member.addRole(role);
// }, 10000);
// });

// //Playing Message
// bot.on("ready", async () => {
//   console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`);

//   bot.user.setActivity("My Code", {type: "PLAYING"});
// });


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

//Token need in token.json
bot.login(token.token);