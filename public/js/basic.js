$(function(){
	/*-----------nav获取日期-----------*/
	(function(){
		var date = new Date() ;
		var year = date.getFullYear() ;
		var month = date.getMonth() + 1 ;
		var day = date.getDate() ;
		var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
		var str = year + '/' + month + '/' + day + '  ' + week[date.getDay()] ;
		$('#time').html(str);
	})() ;

	/*---------index------------*/
	//幻灯片
	(function(){
		$('.index #controller').jFlow({
			slides: '#slides',
			width: '750px',
			height: '300px'
		});
		// 模拟自动播放
		var id ;
		id = setTimeout(move, 5000) ;
		function move()
		{
			$('.index #slidewrap .jFlowNext').triggerHandler('click') ;
			id = setTimeout(move, 5000) ;
		}
		$('.index #slidewrap').hover(function(){
			$(this).addClass('hover') ;
			clearTimeout(id) ;
		}, function(){
			$(this).removeClass('hover') ;
			id = setTimeout(move, 5000) ;
		}) ;
	})() ;

	/*-----------admin------------*/
	$('.admin .module.first').siblings('.module').hide() ;
	$('.admin nav a:first').addClass('selected') ;
	$.each($('.admin nav a'), function(index, elem){
		$(elem).click(function(){
			$(this).addClass('selected').parent().siblings('li').children('a').removeClass('selected') ;
			$($('.admin .module')[index]).show().siblings('.module').hide() ;
			return false ;
		}) ;
	}) ;
	$('.admin #deleteNewsTitle').change(function(){
		if(!$(this).val()) return ;
		$.getJSON('/getNewsContent', {title: $(this).val()}, function(data, status){
			$('.admin #deleteNewsContent').html(data.content) ;
		}) ;
	}) ;
	$('.admin #deleteNewsTitle').change() ;
	$('.admin #updateNewsTitle').change(function(){
		if(!$(this).val()) return ;
		$.getJSON('/getNewsContent', {title: $(this).val()}, function(data, status){
			$('.admin #updateNewsContent').html(data.content) ;
		}) ;
	}) ;
	$('.admin #updateNewsTitle').change() ;
}) ;