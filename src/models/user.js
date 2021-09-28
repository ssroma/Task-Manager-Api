const mongoose = require('mongoose');
// Validator is a packged to manager validation 
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowerCase: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error(`Email ${value} is not valid.`);
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value){
      if(!validator.isLength(value, {min: 6, max: 12}) && value.length < 6 ){
        throw new Error(`Password too Short, Must be at least 6 characters.`);
      }/*else if( !validator.isLength(value, {min: 6, max: 12}) && value.length > 12 ){
        throw new Error(`Password too Long, Must be at max 12 characters.`);
      }*/else{
        if(value.toLowerCase().includes('password')){
          throw new Error(`Password cannot contains :: ${value}`);
        }
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

// return the user profile hidding sensitive info
userSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
} 

// Generate Token
userSchema.methods.generateAuthToken = async function(){
  const user = this; 
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({token: token});
  await user.save();
  // the line above can be written as bellow (ES6 Format)
  //user.tokens = user.tokens.concat({token});

  return token;
}

// Check the login credentials 
userSchema.statics.findByCredentials = async (email, password) => {
  let errorMsg = `Unable to login.`;
  const user = await User.findOne({email});
  if(!user){
    throw new Error(errorMsg);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    throw new Error(errorMsg);
  }
  return user;
}

// Hash the plain text password before saving.
userSchema.pre('save', async function(next){
  const user = this;
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
  const user = this;
  await Task.deleteMany({owner: user._id});
  console.log("Tasks Deleted ... ");
  next();
})

const User = mongoose.model('User', userSchema); 


module.exports = User;