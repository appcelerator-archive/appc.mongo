$(function(){
	function properCase(value) {
		return value.split('-').map(function(k){return k.charAt(0).toUpperCase()+k.substring(1)}).join('-');
	}
	var validURL =/^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
	$('select.method').on('change',function(){
		switch($(this).val()) {
			case 'POST':
			case 'PUT': {
				$('div.body').removeClass('hide');
				break;
			}
			default: {
				$('div.body').addClass('hide');
				break;
			}
		}
	});
	$('button.add-header').on('click',function(){
		var template = $('div.header-template').html(),
			id = Date.now();
		$('form > div.url').after('<div class="form-group form-'+id+'">'+template+'</div>');
		$('div.form-'+id+' button').on('click', function(){
			$(this).parent().parent().remove();
		});
	});
	$('button.add-auth').on('click',function(){
		var template = $('div.auth-template').html(),
			id = Date.now();
		$('form > div.url').after('<div class="form-group form-'+id+'">'+template+'</div>');
		$('div.form-'+id+' button').on('click', function(){
			$(this).parent().parent().remove();
		});
	});
	$('button.execute').on('click',function(){
		$('div.result').removeClass('hide');
		var values = {};
		$.each($('form :input'), function() {
			var el = $(this),
				name = el.attr('name') || el.attr('id'),
				radio = el.attr('type')==='radio',
				checkbox = el.attr('type')==='checkbox',
				val = el.val(),
				hidden = el.parents('.hide').length > 0;
			if (name && !hidden) {
				if ((radio||checkbox) && !el.get(0).checked) {
					return;
				}
				if (name in values) {
					var v = values[name];
					if ($.isArray(v)) {
						v.push(val);
					}
					else {
						values[name] = [v, val];
					}
				}
				else {
					values[name] = val;
				}
			}
		});
		values.user_agent = navigator.userAgent;
		if (!validURL.test(values.url)) {
			return $('div.result-body').html('<div class="col-sm-12 text-danger">Woah. That\'s an invalid URL</div>');
		}
		$('div.result-body').html('<div class="col-sm-12">Your result will go here. One moment...</div>');
		$.ajax({
			url: '/testapi',
			type: 'post',
			data: JSON.stringify(values),
			dataType: 'json',
			contentType: 'application/json', 
			error: function(ajax, status, error) {
				$('div.result-body').html('<div class="col-sm-12 text-danger">'+status+''+error+'</div>');
			},
			success: function(data){
				var html = '';
				console.log(data);
				if (data.success) {
					if (data.response && data.response.statusCode) {
						if (data.response.statusCode === 200) {
							html+='<div class="row"><span style="color:#090"><span class="glyphicon glyphicon-ok-sign"></span> 200 OK</span>, ';
						}
						else {
							html+='<div class="row"><span style="color:#900"><span class="glyphicon glyphicon-remove-sign"></span> '+(data.response.headers['status'] || data.response.statusCode)+'</span>, ';
						}
						html+=data.responseTime+' ms, ';
						html+=data.responseSize+' bytes';
						html+='</div>';
					}
					if (data.response && data.response.headers) {
						var ul = '<div class="row">';
						ul+='<h5 class="text-muted"><a data-toggle="collapse" data-parent="#response_body" href="#headers">Headers</a></h5>';
						ul+='<div id="headers" class="collapse in">';
						for (var k in data.response.headers) {
							var v = data.response.headers[k];
							ul+='<div><strong>'+properCase(k)+'</strong>: '+v+'</div>';
						}
						ul+='</div></div>';
						html+=ul;
					}
					if (data.body) {
						var ct = data.response.headers && data.response.headers['content-type'];
						var h = data.body_html;
						html+='<div class="row">';
						html+='<h5 class="text-muted"><a data-toggle="collapse" data-parent="#response_body" href="#bodyhtml">Body</a></h5>';
						html+='<div class="collapse in" id="bodyhtml"><pre><code class="hljs '+data.body_lang+'">'+h+'</code></pre></div>';
						html+='</div>';

						html+='<div class="row">';
						html+='<h5 class="text-muted"><a data-toggle="collapse" data-parent="#response_body" href="#bodyraw">Raw Body</a></h5>';
						html+='<div class="collapse in" id="bodyraw"><textarea class="form-control" rows="10">'+$('<div/>').text(data.body).html()+'</textarea></div>';
						html+='</div>';
					}
				}
				else {
					html = data.body || '<span style="color:#900"><span class="glyphicon glyphicon-remove-sign"></span> Error fetching URL</span>';					
				}
				$('div.result-body').html('<div class="col-sm-12">'+html+'</div>');
			}
		});
	});
});