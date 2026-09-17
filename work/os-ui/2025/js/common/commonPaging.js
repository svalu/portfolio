/*
사용방법
var opts ={
		'total_record' : 100   // 총 게시물수
	,	'current_page' : 1 //현재 페이지
	,	'block_size'   : 5 //페이징 표시 수
	,	'items_per_page' : 10  //리스트에 뿌려질 게시물 수
	,	'link_to' : 'javascript:movePage(__id__)'
	//,	'preBtn' : '◀'
	//,	'nextBtn' : '▶'
	//,	'defaultCss' : ''
	//,	'curCss' : 'active'
	//, 'prev_show_always' :true
	//,	'next_show_always' :true
	}
	$(".pageing_wrap").paging(opts);
*/

(function($){

	$.extend($.fn, {

		paging : function(opts)
		{
			var options = $.extend($.fn.paging.defaults, opts);
			var current_page = options.current_page;
			var total_record = options.total_record;
			var total_page   = Math.max(Math.ceil(options.total_record / options.items_per_page), 1);
			var start_number;
			var last_start_page;

			var firstBtn = options.firstBtn;
			var nextBtn = options.nextBtn;
			//var nextBtn2 = options.nextBtn2;
			var lastBtn = options.lastBtn;
			var preBtn = options.preBtn;
			//var preBtn2 = options.preBtn2;


			var defaultCss = options.defaultCss;
			var curCss = options.curCss;

			if(nextBtn == undefined || nextBtn == "") {
				nextBtn = options.nextBtn;
			}

			if(preBtn == undefined || preBtn == "") {
				preBtn = options.pre_text;
			}
			//alert(nextBtn);
			//alert(curCss);

			if((current_page%options.block_size) == 0) {
				start_number   = Math.floor((parseInt(current_page)-1)/options.block_size) * options.block_size + 1;
			}else {
				start_number   = Math.floor((parseInt(current_page))/options.block_size) * options.block_size + 1;
			}

			if((total_page%options.block_size) == 0) {
				last_start_page = Math.floor((parseInt(total_page) - 1) / options.block_size) * options.block_size + 1;
			}else {
				last_start_page = Math.floor((parseInt(total_page)) / options.block_size) * options.block_size + 1;
			}

			return this.each(function(){
				var $container = $(this);
				$container.empty();

				var interval = getInterval();

				var appendItem = function(page_id, appendopts)
				{
					appendopts = $.extend({text:page_id, classes:""}, appendopts||{});
					var lnk = $("<div class='page_oj' data='"+page_id+"'>"+(appendopts.text)+"</div>");
					if(appendopts.classes){lnk.addClass(appendopts.classes);}
					$container.append(lnk);
				}

				if(options.preBtn && options.prev_show_always){
					if(start_number > 1 ) {
						appendItem(1,{text:firstBtn, classes:"init"});
						appendItem(parseInt(interval[0])-1,{text:preBtn, classes:"prev"});
					}
				}

				for(var i=interval[0]; i<=interval[1]; i++) {
					appendItem(i);
				}

				if(options.nextBtn && options.next_show_always){
					if (current_page < last_start_page){
						appendItem(parseInt(interval[1])+1,{text:nextBtn, classes:"next"});
						appendItem(total_page,{text:lastBtn, classes:"last"});
					}
				}

				$($container).find(".page_oj[data!="+current_page+"]").on("click", function() {
					var thisPage = $(this).attr("data");
					try {
						// 현재 iframe 요소를 가져옴
						var iframeElement = window.frameElement;

						if (iframeElement) {
							// 부모 문서에서 name이 iframeWindow인 가장 가까운 div를 찾음
							var closestIframeWindow = iframeElement.closest('div[name="iframeWindow"]');

							if (closestIframeWindow) {
								// closestIframeWindow의 width 값을 가져옴
								var width = closestIframeWindow.getBoundingClientRect().width.toFixed(2);
								var height= closestIframeWindow.getBoundingClientRect().height.toFixed(2);

								const iframeBody = $(this).closest("div.iframe_body");
								const workspace = $(this).closest("div.workspace");


								if(!$("div.iframe_body").attr("style")) {
									$(iframeBody).css({"width": parseFloat(width)+4, "height": height, "max-height": 'none'});
									$(workspace).css({ "max-height" : height });
								}
							} else {
								//console.log('name="iframeWindow"을 가진 부모 div를 찾지 못했습니다.');
							}
						} else {
							//console.log('현재 iframe 요소를 가져오지 못했습니다.');
						}
					} catch (e) {
						//console.error('오류 발생:', e);
					}

					/*const iframeBody = $(this).closest("div.iframe_body");
					const workspace = $(this).closest("div.workspace");
					const iframeWidth = $(iframeBody).css("width").replace("px", "");
					const iframeHeight = $(iframeBody).css("height");
					$(iframeBody).css({ "width" : iframeWidth, "height" : iframeHeight, "max-height" : 'none' });
					$(workspace).css({ "max-height" : iframeHeight });
					console.log(iframeWidth, iframeHeight);*/
					eval(options.link_to.replace(/__id__/,thisPage));
				});
				$($container).find(".page_oj[data="+current_page+"]").addClass("active").css("cursor", "default");
			});

			function getInterval()
			{
				var start = start_number;
				if(current_page > last_start_page )  start = last_start_page;
				var end   = Math.min(start_number+options.block_size-1,total_page);
				if(current_page < 0 ) {
					start = 1;
					end  = 10;
				}
				return [start,end];
			}
		}

	});

	$.fn.paging.defaults = {
		'total_record' : 0 ,
		'current_page' : 1 ,
		'items_per_page':10,
		'block_size':10 ,
		'preBtn'    : '◀',
		'nextBtn'    : '▶',
		'firstBtn'	: '◀◀',
		'lastBtn'	: '▶▶',
		'link_to'   : "#",
		'prev_show_always' :true,
		'next_show_always' :true
	};

})(jQuery);
