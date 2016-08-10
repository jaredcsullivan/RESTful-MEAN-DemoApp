var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  itemName: String,
  author : String,
  important: { type: Boolean, default: false},
  subitems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subitem' }]
});

mongoose.model('Item', ItemSchema);