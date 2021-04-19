const Discord = require("discord.js");
const Event = require("../../db/eventSchema");
const sendEmbedMessage = require("../../utils/sendEmbedMessage")
const chooseEvent = require("./chooseEvent")
const chooseGroup = require("./chooseGroup")

module.exports.run = async (bot, message, args) => {
  const date = args[0];

  if (!date || !date.match(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)) {
    message.channel.send("Invalid date.");
    return;
  };

  const eventArray = await Event.find({ date });

  if (!eventArray.length) {
    message.channel.send("No events matching the parameters.");
    return;
  };

  if (eventArray.length > 1) {
    await chooseEvent(message, eventArray);
  } else {
    let eventId = eventArray[0].messageId;
    chooseGroup(message, eventId);
  };
};

module.exports.help = {
  name: "attendance",
  description: "check attendance on events"
};


// TODO: when channels are not set in config, make it work on the same channel where the command was sent