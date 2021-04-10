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
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;