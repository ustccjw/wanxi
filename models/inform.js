var mongodb = require('./db') ;

function Inform(content, time){
	this.content = content ;
	this.time = time ;
} ;

module.exports = Inform ;

Inform.prototype.save = function save(callback){
	var inform = {
		content: this.content,
		time: this.time
	}
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}

		db.collection('informs', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			collection.ensureIndex({content: 1}, {unique: true}) ;
			collection.ensureIndex({time: -1}, {unique: true}) ;

			collection.insert(inform, {safe: true}, function(err, num){
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}
				callback(null) ;
			}) ;
		}) ;
	}) ;
} ;

Inform.del = function del(content, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('informs', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(content){
				query.content = content ;
			}
			collection.remove(query, {safe: true}, function(err, num){   //num is the number of deleted docs
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}
				callback(null) ;
			}) ;
		}) ;
	}) ;
} ;



Inform.getAll = function getAll(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('informs', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			collection.find().sort({time: -1}).toArray(function(err, docs){
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}
				var arr = [] ;
				docs.forEach(function(doc, index){
					var inform = new Inform(doc.content, doc.time) ;
					arr.push(inform) ;
				}) ;
				callback(null, arr) ;
			}) ;
		}) ;
	}) ;
} ;