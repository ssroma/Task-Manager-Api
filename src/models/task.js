const mongoose = require('mongoose');
// Validator is a packged to manager validation 
const validator = require('validator');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

taskSchema.pre('save', async function(next){
  console.log("Task has been saved...")
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;