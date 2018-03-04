const mongoose = require('mongoose');

let User = mongoose.model('User', {
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  password: {
    type: String
  }
});

let Message = mongoose.model('Message',{
  text:{
    type:String,
    required:true
  },
  from:{
    type:String,
    required:true
  },
  createdAt:{
    type:String,
    default:+new Date()
  },
  room:{
    type:String
  },
  source:{
    type:String,
    default:'user'
  }
});



module.exports={User,Message};