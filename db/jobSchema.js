const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: [true, "Provide event."]
  },
  date: {
    type: Date,
    required: [true, "Provide date."]
  }
});

jobSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'event',
    select: 'messageId date alerts active guild'
  })

  next()
})

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;