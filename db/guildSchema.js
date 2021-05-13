const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Provide discord guild ID."]
  },
  memberRole: {
    type: String,
    required: [true, "Provide memberRole name."]
  },
  officerRole: {
    type: String,
    required: [true, "Provide officerRole name."]
  },
  announcementsChannel: {
    type: String,
    required: [true, "Provide announcementsChannel name."]
  },
  remindersChannel: {
    type: String,
    required: [true, "Provide remindersChannel name."]
  },
  commandsChannel: {
    type: String,
    required: [true, "Provide commandsChannel name."]
  }
});

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;