var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');


var Todo = mongoose.model('Todo');
var Item = mongoose.model('Item');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RESTful ToDo' });
});


/* GET all todos. */
router.get('/todos', auth, function(req, res, next) {
	Todo.find({author: req.payload.username}, function(err, todos) {
    	if(err){ return next(err); }

		res.json(todos); 
	});
});

/* POST new todo */
router.post('/todos', auth, function(req, res, next){			
	var todo = new Todo({
			todoName : req.body.todoName,
            author : req.payload.username
		});
		
	todo.save(function(err, todo){
		if(err){ return next(err); }
		
		res.json(todo);
	})
});

/* PARAM for loading a specific todo */
router.param('todo', function(req, res, next, id){
	var query = Todo.findById(id);
	
	query.exec(function(err, todo){
		if (err) { return next(err); }
		if(!todo){ return next(new Error('Can\'t find todo')); }
		
		req.todo = todo;
		return next();
	})
});

/* UPDATE todo */
router.put('/todos/:todo', auth, function(req, res, next){
	var NewTodo = req.body;
	
	Todo.findById(NewTodo._id, function(err, todo){
		if (err){ return next(err); }

		todo.todoName = NewTodo.todoName;
		todo.save(function(err, todo){
			if (err){ return next(err); }
			
			res.json(todo);
		})
	})
});

/* DELETE todo */
router.delete('/todos/:todo', auth, function(req, res, next){
	var todo = req.todo;
	todo.remove(function(err, todo){
		if(err){ return next(err); }
		
		res.json(todo);
	})
});

/* GET an Item */
router.get('/items/:item', auth, function(req, res, next) {
	Item.find({_id: req.params.item}, function(err, item){
		if(err){ return next(err); }
		
		res.json(item);
	});
});

/* GET Items for Todo */
router.get('/todos/:todo/items', auth, function(req, res, next) {
	Item.find({todoId: req.params.todo}, function(err, items){
		if(err){ return next(err); }
		
		res.json(items);
	});
});

/* POST new Item to Todo */
router.post('/todos/:todo/items', auth, function(req, res, next) {
	var item = new Item({
			itemName : req.body.itemName,
			todoId: req.params.todo,
            author : req.payload.username
		});
		
		item.save(function(err, item){
			if(err){ return next(err); }
			
			req.todo.items.push(item);
			req.todo.save(function(err, todo){
				if(err){ return next(err); }
				
				res.json(item);
			})
		})
});

/* UPDATE an item */
router.put('/todos/:todo/items', auth, function(req, res, next){
	var NewItem = req.body;
	
	Item.findById(NewItem._id, function(err, item){
		if (err){ return next(err); }

		item.itemName = NewItem.itemName;
		item.save(function(err, item){
			if (err){ return next(err); }

			res.json(item);
		});
	})
});

/* DELETE an Item */
router.delete('/todos/:item/items', auth, function(req, res, next) {
		Item.remove({
			_id : req.params.item
		}, function(err, item) {
			if (err){ return next(err); }

			Item.find(function(err, items) {
				if (err){ return next(err); }
				
				res.json(items);
			});
		});
});

module.exports = router;