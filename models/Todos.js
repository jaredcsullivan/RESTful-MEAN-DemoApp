var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
  todoName: String,
  author : String,
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

mongoose.model('Todo', TodoSchema);