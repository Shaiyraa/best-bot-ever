const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Provide event type."]
  },
  maxAttendance: {
    type: Number,
    min: 1,
    max: 100,
    default: 100
  },
  date: {
    type: Date,
    required: [true, "Provide event date."]
  },
  messageId: {
    type: String,
    required: [true, "Provide message ID."]
  },
  mandatory: {
    type: Boolean,
    required: [true, "Provide mandatory."]
  },
  alerts: {
    type: String,
    enum: ["yes", "no"],
    default: "yes"
  },
  active: {
    type: Boolean,
    default: true
  },
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild"
  }
});

eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guild',
    select: 'id memberRole announcementsChannel remindersChannel commandsChannel'
  })

  next()
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;