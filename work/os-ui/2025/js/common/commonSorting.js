(function($){
	$.extend($.fn, {
		commonSorting : function(opts)
		{
			let defaultOpts = {
				//"sortField" : "regDate",
				//"sortType" : -1,
				"callback" : function() {}
			};
			let targetClass = "td_sort_wrap";
			let options = $.extend(defaultOpts, opts);
			let sortWrapHtml = $(`<div class="${targetClass}">
						<button id="sortAsc" class="display_none">▴</button>
						<button id="sortDesc" class="display_none">▾</button>
					</div>`);
			const $container = $(this);
			
			const createSortBtn = function($obj) {
				let sort = sortWrapHtml;
				let init = $($container).find("td ."+targetClass).length == 0 ? true : false;
				let tdIdx = $($obj).index();
				$(sort).find("button").addClass("display_none");
				
				if(options.sortField != options.fields[tdIdx] || init) {
					$($container).find("td ."+targetClass).remove(); // sort 버튼 삭제
					options.sortField = options.fields[tdIdx];
					options.sortType = -1;
					$(sort).find("button[id='sortDesc']").removeClass("display_none");
					$($obj).append(sort);
				} else {
					options.sortType = options.sortType * -1;
					var targetBtn = options.sortType == -1? "sortDesc" : "sortAsc";
					$(sort).find("button[id="+targetBtn+"]").removeClass("display_none");
				}
			}
			
			$($container).find("td").each(function(idx, obj) {
				if(options.fields[idx]) {
					//$(obj).attr("field", options.fields[idx]);
					if(options.fields[idx] == options.sortField) {
						createSortBtn($(obj));
					}
				}
			});
			
			$($container).find("td").each(function(idx, obj) {
				if(options.fields[idx] != "") {
					$(obj).on("click", function(event) {
						createSortBtn($(obj));
						var param = {
							"sortField" : options.sortField, 
							"sortType" : options.sortType
						};
						options.callback(param);
					}).css("cursor", "pointer");;	
				}
			});
			/*
			$($container).find("td").on("click", function(event) {
				let targetObj = $(event.target);
				
				if(options.sortField && options.sortType) {
					options.callback(options.sortField, options.sortType);
					createSortBtn($(targetObj));
				} else {
					alert("정렬 대상이 아닙니다.");
				}
			}).css("cursor", "pointer");
			*/
		}
	});
})(jQuery);