var mongoose = require('mongoose');

var SubitemSchema = mongoose.Schema({
	subitemName: String,
	author: String,
    done: { type: Boolean, default: false},
	itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item'}
});

mongoose.model('Subitem', SubitemSchema);