var mongoose = require('mongoose');

var ItemSchema = mongoose.Schema({
	itemName: String,
	author: String,
	todoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}
});

mongoose.model('Item', ItemSchema);