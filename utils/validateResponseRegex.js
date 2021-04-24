const Discord = require("discord.js");
const config = require("../config.json");

const validateResponseRegex = async (message, errMessage, conditions) => {
  let response = ''

  const filter = m => m.author.id === message.author.id;
  await message.channel.awaitMessages(filter, { max: 1, time: 30000 })
    .then(m => {
      m = m.first();
      if (!m || m.content.startsWith(config.prefix)) {
        return response = "exit"
      }
      response = m.content
    })
    .catch((err) => {
      response = "exit"
      console.log(err)
    });

  if (response.match(conditions) || response === "exit") {
    return response
  }

  if (response !== "exit") message.channel.send(errMessage)
  return await validateResponseRegex(message, errMessage, conditions)
};


module.exports = validateResponseRegex