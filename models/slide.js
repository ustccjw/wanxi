var mongodb = require('./db') ;
var fs = require('fs') ;

function Slide(img, disc, time){
	this.img = img ;
	this.disc = disc ;
	this.time = time ;
} ;

module.exports = Slide ;

Slide.prototype.save = function save(callback){
	var slide = {
		img: this.img,
		disc: this.disc,
		time: this.time
	}
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}

		db.collection('slides', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			collection.ensureIndex({disc: 1}, {unique: true}) ;
			collection.ensureIndex({time: -1}, {unique: true}) ;

			collection.insert(slide, {safe: true}, function(err, num){
				mongodb.close() ;
				if(err){
					var outerr = err ;
					fs.unlink(__dirname + "/../public/img/index/" + slide.img, function(err){
						if(err){
							return callback(err) ;
						}
						return callback(outerr) ;
					}) ;
				}
				else{
					callback(null) ;   ////由于err还有I/O操作， 所以需要加else
				}
			}) ;
		}) ;
	}) ;
} ;

Slide.del = function del(disc, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('slides', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(disc){
				query.disc = disc ;
			}
			collection.findOne(query, function(err, doc){
				if(err){
					mongodb.close() ;
					return callback(err) ;
				}
				if(!doc){
					mongodb.close() ;
					return callback(err) ;
				}
				fs.unlink(__dirname + "/../public/img/index/" + doc.img, function(err){
					if(err){
						mongodb.close() ;
						return callback(err) ;
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
		}) ;
	}) ;
} ;



Slide.getAll = function getAll(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('slides', function(err, collection){
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
					var slide = new Slide(doc.img, doc.disc, doc.time) ;
					arr.push(slide) ;
				}) ;
				callback(null, arr) ;
			}) ;
		}) ;
	}) ;
} ;