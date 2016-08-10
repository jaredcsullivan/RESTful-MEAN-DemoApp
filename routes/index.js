var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var Item = mongoose.model('Item');
var Subitem = mongoose.model('Subitem');

/* GET all Items. */
router.get('/items', auth, function(req, res, next) {
	Item.find({author: req.payload.username}, function(err, items) {
    	if(err){ return next(err); }

		res.json(items); 
	});
});

/* POST new Item */
router.post('/items', auth, function(req, res, next){			
	var item = new Item({
			itemName : req.body.itemName,
            author : req.payload.username
		});
		
	item.save(function(err, item){
		if(err){ return next(err); }
		
		res.json(item);
	});
});

/* PARAM for loading a specific Item */
router.param('item', function(req, res, next, id){
	var query = Item.findById(id);
	
	query.exec(function(err, item){
		if (err) { return next(err); }
		if(!item){ return next(new Error('Can\'t find item')); }
		
		req.item = item;
		return next();
	});
});

/* UPDATE an existing Item */
router.put('/items/:item', auth, function(req, res, next){
	var NewItem = req.body;
	
	Item.findById(NewItem._id, function(err, item){
		if (err){ return next(err); }

		item.itemName = NewItem.itemName;
		item.done = NewItem.done;
		item.important = NewItem.important;
		item.subitems = NewItem.subitems;
		
		item.save(function(err, item){
			if (err){ return next(err); }
			
			res.json(item);
		});
	});
});

/* DELETE an Item */
router.delete('/items/:item', auth, function(req, res, next){
	var item = req.item;
	item.remove(function(err, item){
		if(err){ return next(err); }
		
		res.json(item);
	});
});

/* GET a Subitem */
router.get('/subitems/:subitem', auth, function(req, res, next) {
	Subitem.find({_id: req.params.subitem}, function(err, subitem){
		if(err){ return next(err); }
		
		res.json(subitem);
	});
});

/* GET Subitems for an Item */
router.get('/items/:item/subitems', auth, function(req, res, next) {
	Subitem.find({itemId: req.params.item}, function(err, subitems){
		if(err){ return next(err); }
		
		res.json(subitems);
	});
});

/* POST new Subitem on an existing Item */
router.post('/items/:item/subitems', auth, function(req, res, next) {
	var subitem = new Subitem({
			subitemName : req.body.subitemName,
			itemId: req.params.item,
            author : req.payload.username
		});
		
		subitem.save(function(err, subitem){
			if(err){ return next(err); }
			
			req.item.subitems.push(subitem);
			req.item.save(function(err, item){
				if(err){ return next(err); }
				
				res.json(subitem);
			});
		});
});

/* UPDATE an existing Subitem */
router.put('/items/:item/subitems', auth, function(req, res, next){
	var NewSubitem = req.body;
	
	Subitem.findById(NewSubitem._id, function(err, subitem){
		if (err){ return next(err); }

		subitem.subitemName = NewSubitem.subitemName;
		subitem.done = NewSubitem.done;
		subitem.important = NewSubitem.important;
		
		subitem.save(function(err, subitem){
			if (err){ return next(err); }

			res.json(subitem);
		});
	});
});

/* DELETE an existing Subitem */
router.delete('/items/:subitem/subitems', auth, function(req, res, next) {
		Subitem.remove({
			_id : req.params.subitem
		}, function(err, subitem) {
			if (err){ return next(err); }

			Subitem.find(function(err, subitems) {
				if (err){ return next(err); }
				
				res.json(subitems);
			});
		});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MEAN DEMO App' });
});

module.exports = router;