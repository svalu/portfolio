const counselingClassifierUrl = "/rest/api/counselingClassifier"
const zTreeId = "treeCounsellingClasifier";
const saveBtnId = "saveBtn";
const pageStatusMap = {
	INIT : "init",
	NEW : "new",
	MODIFY : "modify",
	HIDDEN : "hidden"
};

let chgData = [];
let zTreeObj;
let isAddable = true; //신규 추가 가능 여부
let isHidden = true; //숨김 여부
let pageStatus = pageStatusMap.INIT;

$(document).ready(function() {
	//저장버튼 
	$(`#${saveBtnId}`).on("click", function() {
		saveCategory();		
	});
	initLtClickEvents();
	getCategoryList();
});


// 드롭다운
function initLtClickEvents() {
  var dropDownMenuEvent = new DropDownMenuEvent({
    selector: "div[name=menu]",
    menuContextHandler: dropDownMenuHandler,
    menus: {
      "create": {
        menuName: "신규",
        callback: addCategory,
        args: []
      },
      "cancel": {
        menuName: "신규 취소",
        callback: cancelCategory,
        args: []
      },
      "hiddenItemOn": {
        menuName: "숨김항목 보기",
        callback: hiddenCategoryOn,
        args: []
      },
      "hiddenItemOff": {
        menuName: "숨김항목 끄기",
        callback: hiddenCategoryOff,
        args: []
      }
    }
  });
}

//신규
function addCategory(event, id) {
	var nodeId = createNodeId();
	var targetNode;
	var tId;
	var nodeParam = {categIsUse:true, isNew:true, id:nodeId, name:""};
	var selectedNode = zTreeObj.getSelectedNodes()[0];

	if(id)
		selectedNode = findNodeById(id);
	
	//대분류 추가
	if(!selectedNode) {
		nodeParam.pId = 0;
		nodeParam.isParent = false;
		targetNode = zTreeObj.addNodes(null, nodeParam);
	} else {
		nodeParam.pId = selectedNode.id;
		targetNode = zTreeObj.addNodes(selectedNode, nodeParam);
	}
	tId = targetNode[0].tId;
	
	//수정모드로 변경
	setTimeout(function() {
		$(`#${tId}_span`).click();
		$(`#${tId}_edit`).click();	
		$(`#${saveBtnId}`).removeClass("display_none");
		pageStatus=pageStatusMap.NEW;
		disableMouseRClick(id);
	}, 10);
}


//신규취소
function cancelCategory(){
	pageStatus=pageStatusMap.INIT;
	var treeNode = zTreeObj.getSelectedNodes();
	zTreeObj.removeNode(treeNode[0]);
	$(`#${saveBtnId}`).addClass("display_none");
	eableMouseRClick(); //마우스 우클릭 이벤트 활성화
}

//숨김항목 보기
function hiddenCategoryOn() {
	var nodes = zTreeObj.getNodesByParam("categIsUse", "false");
	zTreeObj.showNodes(nodes);
	isHidden = false;
	initRtClickEvents();
}

//숨김항목 끄기
function hiddenCategoryOff() {
	var nodes = zTreeObj.getNodesByFilter(node=>(String(node.categIsUse) === "false")); // search the array of the nodes
	zTreeObj.hideNodes(nodes);
	isHidden = true;
	initRtClickEvents();
}

/**
 * 드롭다운 메뉴 제어
 * @param target
 */
function dropDownMenuHandler(target) {
	/*
	미선택 상태에서 신규 : 대분류 신규창 활성
	대분류 선택 후 신규 : 중분류 신규창 활성
	중분류 선택 후 신규 : 소분류 신규창 활성 
	소분류 선택 시 : 신규 비활성화 isAddable
	신규 입력 상태에서는 마우스 우클릭 기능 비활성
	*/
/*	let nodes = zTreeObj.getNodesByParam("categIsUse", "false");
	let isHIdden = nodes.length !== 0;*/
	let isEdit = $("#"+zTreeId+" li input:text").length > 0;
	let newMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "신규" } );
	let hiddenOnMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "숨김항목 보기" } ); 
	let hiddenOffMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "숨김항목 끄기" } );
	let calcelMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "신규 취소" } );
	
	if(isEdit) { //신규추가, 수정 중일 때 숨김보기/끄기 비활성화
		hiddenOnMenu.addClass("inactive").off("click");
		hiddenOffMenu.addClass("inactive").off("click");
	} else {
		//숨겨진 카테고리가 있으면 
		if(isHidden) {
			hiddenOnMenu.removeClass("inactive").off("click").on("click", hiddenCategoryOn);
			hiddenOffMenu.addClass("inactive").off("click");
		} else {
			hiddenOffMenu.removeClass("inactive").off("click").on("click", hiddenCategoryOff);
			hiddenOnMenu.addClass("inactive").off("click");
		}
	}
	
	switch(pageStatus) {
		case pageStatusMap.INIT: //초기
			newMenu.removeClass("inactive").off("click").on("click", addCategory);
			calcelMenu.addClass("inactive").off("click");
			break;
		
		case pageStatusMap.NEW: //신규
			newMenu.addClass("inactive").off("click");
			calcelMenu.removeClass("inactive").off("click").on("click", cancelCategory);
			break;
			
		case pageStatusMap.MODIFY: //수정
		case pageStatusMap.HIDDEN: //숨김
			newMenu.addClass("inactive").off("click");
			hiddenOnMenu.addClass("inactive").off("click"); 
			hiddenOffMenu.addClass("inactive").off("click");
			calcelMenu.addClass("inactive").off("click");
			break;
	}
}

// 마우스 우클릭 이벤트 생성
function initRtClickEvents() {
  var notepadRtClickEvent = new RtMouseClickEvent({
    //selector: "li[name=notepadTitle][data-ismenuable=true]",
    selector: "#"+zTreeId+" a[data-ismenuable=true]",
    menuContextHandler: rtClickEventMenuHandler,
    menus: {
		"remove": {
			menuName: "수정",
			callback: modifyCategory,
			args: ["id"]
		},
		"hidden": {
			menuName: "숨김",
			callback: hiddenCategory,
			args: ["id"]
		},
		"calcel": {
			menuName: "취소",
			callback: modifyCancel,
			args: ["id"]
		},
		"init": {
			menuName: "신규",
			callback: addCategory,
			args: ["id"]
		},
	}
  });
}

//카테고리 수정
function modifyCategory(event, id) {
	//var zTree = $.fn.zTree.getZTreeObj(zTreeId);
	var targetNode = findNodeById(id);
	zTreeObj.editName(targetNode);	
	pageStatus=pageStatusMap.MODIFY;
	
	$(`#${saveBtnId}`).removeClass("display_none"); //저장버튼 활성화
	disableMouseRClick(id);//우클립 비활성화
	//드롭다운 비활성 
}

//카테고리 숨김 confirm
function hiddenCategory(event, id) {
	var confirmCallback = function() {
		hiddenCategoryAct(id);
	}
	uiConfirm("한번 숨김처리 된 분류는 되돌리기가 불가합니다.\n숨김처리 하시겠습니까?", confirmCallback);
}

//카테고리 숨김
function hiddenCategoryAct(id) {
	
	var targetNode = findNodeById(id);
	targetNode.categIsUse = false;
	chgDataSet("update", targetNode);
	
	//하위 노드 삭제 데이터 설정
	var childNodes = targetNode.children;
	for(var i in childNodes) {
		targetNode =   findNodeById(childNodes[i].id); 
		targetNode.categIsUse = false;
		chgDataSet("update", targetNode);
		//console.log(targetNode);
	}
	
	hiddenCategoryOff();
	$(`#${saveBtnId}`).removeClass("display_none");
	pageStatus = pageStatusMap.HIDDEN;
}

//마우스 우클릭 취소
function modifyCancel(event, id) {

	if(pageStatus == pageStatusMap.NEW){
		cancelCategory();
	}
	else{
		$(`#${saveBtnId}`).addClass("display_none");
		var targetNode =  findNodeById(id);

		//수정 취소 시 이전 데이터로 세팅
		targetNode.name = targetNode.originData;
		zTreeObj.refresh();

		zTreeObj.cancelEditName(); //zTree 수정모드 취소
		pageStatus = pageStatusMap.INIT;
		eableMouseRClick();
	}

}

//마우스 우클릭 이벤트 활성
function eableMouseRClick() {
	$(zTreeObj.getNodesByFilter( node=>(String(node.categIsUse) === "true") )).each(function(idx, obj) {
		$("#"+zTreeId+" a[data-id='"+obj.id+"']").attr("data-ismenuable", true);
	});
}

//마우스 우클릭 이벤트 비활성
function disableMouseRClick(id) {
	if(id) $("#"+zTreeId+" a").not("[data-id="+id+"]").attr("data-ismenuable", false);
	else $("#"+zTreeId+" a").attr("data-ismenuable", false);
}

/**
 *      우클릭 메뉴 항목 생성
 * */
function rtClickEventMenuHandler(target) {
	//console.log(target);
	//console.log(target.data("id"));
	let modifyMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "수정" ); });
	let hiddenMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "숨김" ); });
	let calcelMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "취소" ); });
	let initMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "신규" ); });

	let param = target.data("id");
	
	if(pageStatus == pageStatusMap.INIT) { //초기화
		modifyMenu.removeClass("inactive").off("click").on("click", function(event) { modifyCategory(event, param); });
		hiddenMenu.removeClass("inactive").off("click").on("click", function(event) { hiddenCategory(event, param); });
		calcelMenu.addClass("inactive").off("click"); 
	} else if(pageStatus == pageStatusMap.MODIFY) { //수정 
		modifyMenu.addClass("inactive").off("click");
		hiddenMenu.addClass("inactive").off("click");
		initMenu.addClass("inactive").off("click");
		calcelMenu.removeClass("inactive").off("click").on("click", function(event) { modifyCancel(event, param); } );
	} else if(pageStatus == pageStatusMap.HIDDEN) { //숨김 
		modifyMenu.addClass("inactive").off("click");
		hiddenMenu.addClass("inactive").off("click"); 
		calcelMenu.addClass("inactive").off("click");
	}
	else if(pageStatus == pageStatusMap.NEW) { //신규
		modifyMenu.addClass("inactive").off("click");
		hiddenMenu.addClass("inactive").off("click");
		initMenu.addClass("inactive").off("click");
	}
}

var setting = {
  view: {
    //addHoverDom: addHoverDom,
    //removeHoverDom: removeHoverDom,
    selectedMulti: false, 
    editNodeBlur: true
  },
  edit: {
    enable: true,
    editNameSelectAll: true,
    showRemoveBtn: true,
    showRenameBtn: true
  },
  data: {
    simpleData: {
      enable: true,
      pIdKey: "parentId",
      rootPId:null
    }
  },
  callback: {
    beforeDrag: beforeDrag,
    beforeDrop: beforeDrop,
    beforeRemove: beforeRemove,
    onRemove: onRemove,
    onRename: categoryRename,
    beforeRename: categoryBeforRename,
    onClick: categoryClick
  }
};

//카테고리 클릭
function categoryClick(event, treeId, treeNode) {
	//3depth 이상일 때 추가 불가 
	if(treeNode.level > 1) {
		isAddable = false;
	} else {
		isAddable = true;
	}
	zTreeObj.expandNode(treeNode, true, true, false);
}

//입력 validation 체크
function categoryBeforRename(treeId, treeNode, newName, isCancel) {
	if($.trim(newName).length < 1) {
		if(!treeNode.isNew) { //수정일 때 입력 안하면 알림창 띄우고 기존 카테고리명 입력
			uiAlert("카테고리명을 입력해 주세요.", function() {
				$("#"+treeNode.tId+"_input").val(treeNode.name);
			});
		} else { //신규일 때 입력 취소 
			//zTreeObj.removeNode(treeNode);
		}
		return false;
	} else if($.trim(newName) == treeNode.name) { //수정된 내용이 없으면 입력 취소
		//$(`#${saveBtnId}`).addClass("display_none");
		//modifyCancel("", treeNode.id);
		return false;
	}
}

//카테고리명 변경됐을 경우
function categoryRename(event, treeId, treeNode, isCancel) {
	var nodeId = treeNode.id;
	var nodeValue = treeNode.name;
	var chgMode = "update";
	if(treeNode.isNew) chgMode = "insert"; 
	
	chgDataSet(chgMode, treeNode);
}

//저장데이터 설정
function chgDataSet(mode, treeNode) {
	var categId = treeNode.id;
	var isPush = true;
	var isNew = treeNode.isNew;
	var seq = zTreeObj.getNodeIndex(treeNode);
	var data = {
		"id" : categId,
		"parentId" : treeNode.parentId,
		"categName" : treeNode.name,
		"categLevel" : treeNode.level, 
		"categIsUse" : treeNode.categIsUse,
		"categSeq" : seq,
		"dataMode" : mode
	}
	
	chgData.forEach((obj, idx) => {
		//신규입력인데, 삭제일 때는 해당 데이터 삭제 
		if(isNew && mode == "delete") {
			chgData.splice(idx, 1);
			isPush = false;
			return false;
		}
		
		//아이디가 같으면 데이터 업데이트
		if(obj.id == categId) {
			$.extend(obj, data);
			isPush = false;
			return false;
		}     
	})
	
	//변경 데이터 push
	if(isPush) chgData.push(data);
}


//아이디로 노드 찾기
function findNodeById(id) {
	return zTreeObj.getNodeByParam("id", id, null);
}

//카테고리 리스트
function getCategoryList() {
  $.ajax({
    url: counselingClassifierUrl+'/list', // 요청할 URL
    type: 'POST',
    dataType: 'json',
    success: function (rstData) {
	  	let dataList = rstData.data;
	  	
	  	//숨김처리
	  	$(dataList).each(function(idx, obj) {
			obj.originData = obj.name;
			if(String(obj.categIsUse) == "false") {
				obj.name = obj.name+" - 숨김";
			}
		});
	  	
      zTreeObj = $.fn.zTree.init($("#"+zTreeId), setting, dataList);
      hiddenCategoryOff(); //숨김항목 안나오게 
      zTreeObj.expandAll(true); //모든 트리 펼치기
      pageStatus = pageStatusMap.INIT;
      initRtClickEvents();
    },
    error: function (error) {
      // 요청이 실패했을 때 실행될 함수
      console.error("An error occurred:", error);
    }
  });
}

//상태 초기화
function initData() {
	
	pageStatus = pageStatusMap.INIT;
	isAddable = true;
	$(`#${saveBtnId}`).addClass("display_none");
	eableMouseRClick();
	var nodes = zTreeObj.getSelectedNodes();
	if (nodes.length>0) zTreeObj.cancelSelectedNode();
	
	//저장 후 isNew false로 변경
	$(chgData).each(function(idx, obj) {
		if(obj.dataMode == "insert") {
			var targetNode = findNodeById(obj.id);
			if(targetNode) targetNode.isNew = false;
		}
	});
	zTreeObj.refresh(); //트리 refresh
	chgData = [];
}

//카테고리 저장
function saveCategory() {
	if(chgData.length == 0) {
		uiAlert("변경된 내용이 없습니다.");
	} else {
		
		var categoryList = {
			"categoryList" : JSON.stringify(chgData)
		};
		
		$.ajax({
		    url: counselingClassifierUrl+'/save', // 요청할 URL
		    type: 'POST',
		    data: categoryList,
		    dataType: 'json',
		    success: function (rstData) {
				
				if(rstData.data == "success") {
					uiAlert("저장되었습니다.", function() {
						initData();
						getCategoryList()
					});	
				} else {
					uiAlert("저장 실패");
				}
		    },
		    error: function (error) {
		      // 요청이 실패했을 때 실행될 함수
		      console.error("An error occurred:", error);
		    }
		});
	}	
}

//카테고리 임시 아이디 생성
function createNodeId() {
	return new ObjectId().toString();
}

function beforeDrag(treeId, treeNodes) {	//(call)
	return false;
}
function beforeDrop(treeId, treeNodes, targetNode, moveType) {	//(call)
	return false;
 // return targetNode ? targetNode.drop !== false : true;
}

//삭제 전 호출
function beforeRemove(treeId, treeNode) {	//(call)
	//var zTree = $.fn.zTree.getZTreeObj(zTreeId);
	//zTreeObj.selectNode(treeNode);
	//return confirm("Confirm delete node '" + treeNode.name + "' it?");
}
function onRemove(e, treeId, treeNode) {	//(call)
  //console.log("[ "+getTime()+" onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
}
/*
function getTime() {
  var now= new Date(),
      h=now.getHours(),
      m=now.getMinutes(),
      s=now.getSeconds(),
      ms=now.getMilliseconds();
  return (h+":"+m+":"+s+ " " +ms);
}
*/
/*
function addHoverDom(treeId, treeNode) { //(call)
};

function removeHoverDom(treeId, treeNode) {	//(call)
  $("#addBtn_"+treeNode.tId).unbind().remove();
};
*/