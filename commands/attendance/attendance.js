const Discord = require("discord.js");
const chooseEvent = require("./chooseEvent")
const chooseGroup = require("./chooseGroup")
const valiadateResponseRegex = require("../../utils/validateResponseRegex")

const Event = require("../../db/eventSchema");

module.exports.run = async (bot, message, args) => {

  let date = args[0];

  if (!date) {

    message.channel.send("Please provide the date of the event (dd-mm-yyyy).");
    date = await valiadateResponseRegex(message, "Invalid date.", /^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g);

    if (date === "exit") {
      return;
    };

  } else {

    if (!date.match(/^(?:(?:31(\/|-|.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g)) {
      message.channel.send("Invalid date (correct format: ?attendance dd-mm-yyyy).");
      return;
    };

  };

  // format the date correctly
  date = date.split(/\D/g)[1] + "-" + date.split(/\D/g)[0] + "-" + date.split(/\D/g)[2];
  // get the event date + 1 day
  let nextDayDate = new Date(date);
  nextDayDate.setDate(nextDayDate.getDate() + 1);

  const eventArray = await Event.find({ date: { $gt: date, $lt: nextDayDate } });

  if (!eventArray.length) {
    message.channel.send("No events matching the parameters.");
    return;
  };

  if (eventArray.length > 1) {
    await chooseEvent(message, eventArray);
  } else {
    let eventId = eventArray[0].messageId;
    await chooseGroup(message, eventId);
  };
};

module.exports.help = {
  name: "attendance",
  description: "?attendance [dd/mm/yyyy] to check lists of people who did and didn't react to the event"
};