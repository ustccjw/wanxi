var mongodb = require('./db') ;
var fs = require('fs') ;

function News(title, content, img, time){
	this.title = title ;
	this.content = content ;
	this.img = img ;
	this.time = time ;
}
module.exports = News ;

News.prototype.save = function save(callback){
	var news = {
		title: this.title,
		content: this.content,
		img: this.img,
		time: this.time
	} ;
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			collection.ensureIndex({title: 1}, {unique: true}) ;
			collection.ensureIndex({time: -1}, {unique: true}) ;
			collection.insert(news, {safe: true}, function(err, doc){
				mongodb.close() ;
				if(err){
					var outerr = err ;
					fs.unlink(__dirname + "/../public/img/news/" + news.img, function(err){
						if(err){
							return callback(err) ;
						}
						return callback(outerr) ;
					}) ;
				}
				else{
					callback(null) ;   //由于err还有I/O操作， 所以需要加else
				}
			}) ;
		}) ;
	}) ;
} ;

News.prototype.update = function update(callback){
	var news = {
		title: this.title,
		content: this.content,
		img: this.img,
		time: this.time
	} ;
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(news.title){
				query.title = news.title ;
			}
			var set = {} ;
			if(news.content){
				set.content = news.content ;
			}
			collection.update(query, {$set: set}, {safe: true}, function(err, num){  //num更新的docs数目
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}
				callback(null) ;
			}) ;
		}) ;
	}) ;
} ;

News.getAll = function getAll(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
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
					var news = new News(doc.title, doc.content, doc.img, doc.time) ;
					arr.push(news) ;
				}) ;
				callback(null, arr) ;
			}) ;
		}) ;
	}) ;
} ;


News.getByTime = function getByTime(time, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(time){
				query.time = +time ;
			}
			collection.findOne(query, function(err, doc){
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}

				var news = null;
				if(doc) news = new News(doc.title, doc.content, doc.img, doc.time) ;
				callback(null, news) ;
			}) ;
		}) ;
	}) ;
} ;

News.getByTitle = function getByTitle(title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(title){
				query.title = title ;
			}
			collection.findOne(query, function(err, doc){
				mongodb.close() ;
				if(err){
					return callback(err) ;
				}
				
				var news = null;
				if(doc) news = new News(doc.title, doc.content, doc.img, doc.time) ;
				callback(null, news) ;
			}) ;
		}) ;
	}) ;
} ;


News.del = function del(title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err) ;
		}
		db.collection('news', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			var query = {} ;
			if(title){
				query.title = title ;
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
				
				fs.unlink(__dirname + "/../public/img/news/" + doc.img, function(err){
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
	