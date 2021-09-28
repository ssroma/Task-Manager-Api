const mongoose = require('mongoose');

/*
/ Mongoose is a ODM Object Document Mapping
/ use to modeling the databse type and help structure 
/ you documents
*/

mongoose.connect(`${process.env.MONGODB_CONNECT_URL}`, {
  useNewUrlParser: true
});





