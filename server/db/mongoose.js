const mongoose = require('mongoose'); // bring mongoose library

// get MongoDB link from environment or use local database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ex5';

// connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,     // use new URL parser
  useUnifiedTopology: true, // use new connection engine
})
.then(() => console.log('Connected to MongoDB!')) // if connect success, show message
.catch(err => {
  // if error happen, show error and stop program
  console.error('MongoDB connection error:', err.message);
  process.exit(1); // stop app
});

// export mongoose to use in other files
module.exports = mongoose;
