
/*
 * GET home page.
 */
var path = require('path')
var fs = require('fs') ;
var News = require('../models/news.js') ;
var Inform = require('../models/inform.js') ;
var Slide = require('../models/slide.js') ;

module.exports = function(app){
	app.get('/', function(req, res){
		News.getAll(function(err, data){
			if(err){
				return res.redict('/error') ;
			}
			var newsArr = data.slice(0, 5) ;
			Inform.getAll(function(err, data){
				if(err){
					return res.redict('/error') ;
				}
				var informArr = data.slice(0, 4) ;
				Slide.getAll(function(err, data){
					if(err){
						return res.redict('/error') ;
					}
					var slideArr = data.slice(0, 6) ;
					res.render('index', {
						news: newsArr,
						informs: informArr,
						slides: slideArr
					}) ;
				}) ;
			}) ;
		}) ;
	}) ;
	

	app.get('/login', function(req, res){                //登陆页面
		res.render('login', {}) ;
	}) ;
	app.post('/login', function(req, res){              //验证登陆
		var user = {
			username: 'ustccjw',
			password: 'ustccjw'
		} ;
		if(req.body.username !== user.username && req.body.password !== user.password){
			req.session.error = '账户密码错误' ;
			return res.redirect('/login') ;
		}
		req.session.flag = 1 ;
		req.session.success = '管理员登陆成功' ;
		res.redirect('/admin') ;
	}) ;
	

	app.all('/admin', check) ;
	app.get('/admin', function(req, res){         //加载admin页面
		News.getAll(function(err, data){
			if(err){
				return res.redict('/error') ;
			}
			var newsArr = data.slice(0) ;
			Inform.getAll(function(err, data){
				if(err){
					return res.redict('/error') ;
				}
				var informArr = data.slice(0) ;
				Slide.getAll(function(err, data){
					if(err){
						return res.redict('/error') ;
					}
					var slideArr = data.slice(0) ;
					res.render('admin', {news: newsArr, informs: informArr, slides: slideArr, type: req.query.type}) ;
				}) ;
			}) ;
		}) ;
	}) ;


	app.post('/admin/addnews', function(req, res){      //处理添加新闻请求
		if(req.body.title && req.body.content && req.files.img.size){
			var time = +(new Date()), 
				img ;
			var filePath = req.files.img.path ;
			var extName = path.extname(req.files.img.name) ;
			img = time + extName ;
			var newPath = __dirname + '/../public/img/news/' + img ;
			fs.readFile(filePath, function(err, data){
				if (err){
					req.session.error = '添加出错' ;
					return res.redirect('/admin') ;
				}
				fs.writeFile(newPath, data, function(err){
					if(err){
						req.session.error = '添加出错' ;
						return res.redirect('/admin') ;
					}
					var news = new News(req.body.title, req.body.content, img, time) ;
					news.save(function(err){
						if(err){
							req.session.error = '添加出错' ;
							return res.redirect('/admin') ;
						}
						req.session.success = '添加成功' ;
						res.redirect('/admin') ;
					}) ;
				});
			});
		}
		else{
			req.session.error = '添加出错' ;
			res.redirect('/admin') ;
		}
	}) ;


	app.post('/admin/updatenews', function(req, res){      //处理更新新闻请求
		if(!req.body.title){
			req.session.error = '更新出错' ;
			return res.redirect('/admin') ;
		}
		if(!req.body.content && !req.files.img){
			req.session.error = '更新出错' ;
			return res.redirect('/admin') ;
		}
		if(req.files.img.size){
			var img ;
			var filePath = req.files.img.path ;
			News.getByTitle(req.body.title, function(err, data){
				if(err || !data){
					req.session.error = '更新出错' ;
					return res.redirect('/admin') ;
				}
				var newPath = __dirname + '/../public/img/news/' + data.img ;
				fs.unlink(newPath, function(err){
					if(err){
						return callback(err) ;
					}
					fs.readFile(filePath, function(err, data){
						if (err){
							req.session.error = '更新出错' ;
							return res.redirect('/admin') ;
						}
						fs.writeFile(newPath, data, function(err){
							if(err){
								req.session.error = '更新出错' ;
								return res.redirect('/admin') ;
							}
							var news = new News(req.body.title, req.body.content) ;
							news.update(function(err){
								if(err){
									req.session.error = '更新出错' ;
									return res.redirect('/admin') ;
								}
								req.session.success = '更新成功' ;
								res.redirect('/admin') ;
							}) ;
						});
					});
				}) ;
			}) ;
		}
		else{
			var news = new News(req.body.title, req.body.content) ;
			news.update(function(err){
				if(err){
					req.session.error = '更新出错' ;
					return res.redirect('/admin') ;
				}
				req.session.success = '更新成功' ;
				res.redirect('/admin') ;
			}) ;
		}
	}) ;


	app.post('/admin/delnews', function(req, res){    //处理删除新闻请求
		var title = req.body.title ;
		if(!title){
			req.session.error = '删除出错' ;
			return res.redirect('/admin') ;
		}
		News.del(title, function(err){
			if(err){
				req.session.error = '删除出错' ;
				return res.redirect('/admin') ;
			}
			req.session.success = '删除成功' ;
			res.redirect('/admin') ;
		}) ;
	}) ;


	app.post('/admin/addinform', function(req, res){    //处理添加通知请求
		var content = req.body.content ;
		if(!content){
			req.session.error = '添加出错' ;
			return res.redirect('/admin?type=inform') ;
		}
		var inform = new Inform(content, +(new Date())) ;
		inform .save(function(err){
			if(err){
				req.session.error = '添加出错' ;
				return res.redirect('/admin?type=inform') ;
			}
			req.session.success = '添加成功' ;
			res.redirect('/admin?type=inform') ;
		}) ;
	}) ;



	app.post('/admin/delinform', function(req, res){    //处理删除通知请求
		var content = req.body.content ;
		if(!content){
			req.session.error = '删除出错' ;
			return res.redirect('/admin?type=inform') ;
		}
		Inform.del(content, function(err){
			if(err){
				req.session.error = '删除出错' ;
				return res.redirect('/admin?type=inform') ;
			}
			req.session.success = '删除成功' ;
			res.redirect('/admin?type=inform') ;
		}) ;
	}) ;


	app.post('/admin/addslide', function(req, res){    // 处理添加幻灯片请求
		if(req.body.disc && req.files.img.size){
			var time = +(new Date()), 
				img ;
			var filePath = req.files.img.path ;
			var extName = path.extname(req.files.img.name) ;
			img = time + extName ;
			var newPath = __dirname + '/../public/img/index/' + img ;
			fs.readFile(filePath, function(err, data){
				if (err){
					req.session.error = '添加出错' ;
					return res.redirect('/admin?type=slide') ;
				}
				fs.writeFile(newPath, data, function(err){
					if(err){
						req.session.error = '添加出错' ;
						return res.redirect('/admin?type=slide') ;
					}
					var slide = new Slide(img, req.body.disc, time) ;
					slide.save(function(err){
						if(err){
							req.session.error = '添加出错' ;
							return res.redirect('/admin?type=slide') ;
						}
						req.session.success = '添加成功' ;
						res.redirect('/admin?type=slide') ;
					}) ;
				});
			});
		}
		else{
			req.session.error = '添加出错' ;
			res.redirect('/admin?type=slide') ;
		}
	}) ;

	app.post('/admin/delslide', function(req, res){    //处理删除幻灯片请求
		var disc = req.body.disc ;
		if(!disc){
			req.session.error = '删除出错' ;
			return res.redirect('/admin?type=slide') ;
		}
		Slide.del(disc, function(err){
			if(err){
				req.session.error = '删除出错' ;
				return res.redirect('/admin?type=slide') ;
			}
			req.session.success = '删除成功' ;
			res.redirect('/admin?type=slide') ;
		}) ;
	}) ;



	app.get('/news', function(req, res){    //加载news页面
		var time = req.query.time ;
		if(!time){
			req.session.error = '加载出错' ;
			return res.redirect('/') ;
		}
		News.getByTime(time, function(err, data){
			if(err || !data){
				req.session.error = '加载出错' ;
				return res.redirect('/') ;
			}
			res.render('news', {news: data}) ;
		}) ;
	}) ;


	app.get('/getNewsContent', function(req, res){  //处理ajax请求
		var title = req.query.title ;
		if(!title){
			return res.json({content: ''}) ;
		}
		News.getByTitle(title, function(err, data){
			if(err || !data){
				return res.json({content: ''}) ;
			}
			res.json({content: data.content}) ;
		}) ;
	}) ;


	app.get('/wanxi', function(req, res){
		res.render('wanxi') ;
	}) ;



	app.get('/informlist', function(req, res){
		Inform.getAll(function(err, data){
				if(err){
					return res.redict('/error') ;
				}
				var informArr = data.slice(0) ;
				res.render('informlist', {
					informs: informArr
				}) ;
		}) ;
	}) ;

	app.get('/newslist', function(req, res){
		News.getAll(function(err, data){
				if(err){
					return res.redict('/error') ;
				}
				var newsArr = data.slice(0) ;
				res.render('newslist', {
					news: newsArr
				}) ;
		}) ;
	}) ;



	function check(req, res, next){
		if(!req.session.flag){
			req.session.error = '您无此权限' ;
			return res.redirect('/') ;
		}
		next() ;
	}

	return app.router;
} ;