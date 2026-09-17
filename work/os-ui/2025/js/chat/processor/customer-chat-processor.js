class CustomerChatProcessor {
    constructor(channelId, loginId, assignOId, userGrp, postProcessor, cusSessionId) {
        this._channelId = channelId;
        this._loginId = loginId;
        this._assignOId = assignOId;
       	this._preGroupId = "";
        this._userGrp = userGrp;
        this._serviceGrpCd = "";
		this._postProcessor = postProcessor;
		this._cusSessionId = cusSessionId;
		this._chatDateFormat = "TT hh:MM:ss";

    }
    
    initEvent(assignOId) {
		const $this = this;
		
		//채팅 스크롤바 제일 밑으로 이동
		let ovserveTarget = $("div.chat_view_wrap").get(0);
		let observer = new MutationObserver((mutations) => {
			var mesgs = $('.chat_view_wrap');
			mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
		})
		let option = {
	    	attributes: true,
		    childList: true,
		    characterData: true
		};
		observer.observe(ovserveTarget, option);
		//채팅 스크롤바 제일 밑으로 이동
		
		//드롭다운 
		var dropDownMenuEvent = new DropDownMenuEvent({
	        selector : "div.setting_line_oj",
	        menuContextHandler: $this.dropDownMenuHandler,
	        menus : {
	            "transfer" : {
	                menuName : "상담이관",
	                callback : function() { chatTransfer($this._assignOId); },
	                args : ["id"]
	            },
	            "chatEnd" : {
					menuName : "채팅종료",
	                callback : function() { $this.closeChatConfirm(); },
	                args : []
				}
	        }
	    });

		//첨부요청
		$("#fillAttachReq").on("click", function (event) {
			uiConfirm("첨부파일 요청을 하시겠습니까?", function() {
				$this.autoMsgSend("FILE_ATTACH_REQ");
			});
		})

		//상담이력
		$("#chatHistory").on("click", function(event) {
			//실행창 크기 조절 시 iframe_body에 width가 고정되어 width 동적 조절이 안되어서 초기화 해 줌
			$("#chatHistory").parents("div.iframe_body").removeAttr("style");
			$("#chatHistoryDiv").toggleClass("fold");
		});

		//후처리
		$(".side_bar").css("cursor", "pointer");
		$("#postProcess").on("click", function(event) {
			if(!$("#postProcessDiv").hasClass("active")) {
				$this._postProcessor.getCnslAssingData(function() {
					$("#postProcessDiv").toggleClass("active");
				});
			} else {
				$("#postProcessDiv").toggleClass("active");
			}
		});
		$(document).on("keyup", function(event) {
			if($("#postProcessDiv").hasClass("active") && event.keyCode == 27 || event.which == 27 )
				$("#postProcessDiv").removeClass("active");
		})


		//상담이력 접기
		$("#foldBtn").on("click", function(event) {
			$("#chatHistory").trigger("click");
		});

		//상담이력 전화번호
		$("#searchUserMobile").validateOnInput("phone");

		//상담이력 조회
		$("#searchHistoryBtn").on("click", function(event) {
			$("#chatHistoryDetailDev").addClass("display_none");
			$("#chatHistoryDetailDev td.text_l").html("");
			$this.getPostProcHist();
		});

		
		//컨트롤 + 엔터 : 메시지 전송
		$('#textarea').bind({
	        keydown: function(e) {
				
				if (e.keyCode == 13 && e.altKey) {
					const textVal = $(this).val() + "\n"; 
					$(this).val(textVal);
				} else if (e.keyCode == 13) {
					e.preventDefault();
	                if($.trim(this.value) != "") $('#messenger_send_bu').click();
	            }
	        }
	    });
		
		//보내기 클릭
        $('#messenger_send_bu').click(() => {
			if(document.getElementById("textarea").readOnly) {
				window.parent.uiAlert("채팅이 종료되었습니다.");
				return;
			}
			
            const textarea = $('#textarea');
            const contents = textarea.val().replaceAll("\n", "<br>");

			if(this.filterPrhbWord(contents)) return;

            const data = {
                groupId : this._channelId,
                loginId : this._loginId,
                sender : "USER",
                msg : contents,
                reqTypeCd	: "CHAT",
				userGrp 	: this._userGrp,
				serviceGrpCd : this._serviceGrpCd
				
            };
            if($.trim(contents) != "") {
	            window.parent.customerStomp.send(data);
	            textarea.val('');
            }
        });
    }

	async getPostProcHist() {
		const $this = this;
		const params = {
			"userName": $("#searchUserName").val(),
			"userMobile": $("#searchUserMobile").val()
		};

		if(params.userName == '' && params.userMobile == '') {
			uiAlert("이름이나 전화번호를 입력해 주세요");
			return;
		}

		const tmpData = await getPostProcHistory(params);
		const postProcData = tmpData.data.data;

		let html = "";
		if(postProcData.length > 0) {

			$(postProcData).each(function(idx, obj) {
				html += `<tr targetId="${obj.targetId}">
                            <td class="table_text_over">${obj.postProcTitle}</td>
                            <td>${obj.mbrName}</td>
                            <td>${CNSL_TYPE[obj.postProcType]}</td>
                            <td class="table_text_num">${new Date(obj.regDate).format("yyyy-mm-dd<br>(HH:MM:ss)")}</td>
                        </tr>`;
			});

		} else {
			html = `<tr>
                            <td colspan="4">데이터가 없습니다.</td>
                        </tr>`;
		}
		$("#postProcHistoryTable tr").not(".table_title_line").remove();
		$("#postProcHistoryTable").append(html);

		//툴팁
		$(".table_text_over").each(function(idx, obj) {
			generateTextMemo(obj);
		});

		$("#postProcHistoryTable tr").not(".table_title_line").css("cursor","pointer").on('click', function(event) {
			$this.getPostProcHistDetail($(this).attr("targetId"));
		})
	}

	async getPostProcHistDetail(targetId) {

		$("#chatHistoryDetailDev").removeClass("display_none");
		const tmpData = await getPostProcHistoryDetail(targetId);
		const data = tmpData.data.data;

		$("#detail_userName").html(data.userName);
		$("#detail_userMobile").html(data.userMobile);
		$("#detail_cnslDate").html(data.cnslDate);
		$("#detail_categName").html(data.categName);
		$("#detail_postProcTitle").html(data.postProcTitle);
		$("#detail_postProcContent").html(data.postProcContent.replaceAll("\n", "<br>"));
	}
     dropDownMenuHandler(target) {
		
		let isEnd = document.getElementById("textarea").readOnly;
		const chatTransfer = $("#dropDownMenu span").filter( function() { return $(this).text() === "상담이관" } );
		const chatEnd = $("#dropDownMenu span").filter( function() { return $(this).text() === "채팅종료" } );
		
		if(isEnd) {
			chatTransfer.addClass("inactive").off("click");
			chatEnd.addClass("inactive").off("click");
		} else {
			//chatTransfer.removeClass("inactive").off("click").on("click", $this.closeChatConfirm());
			//chatEnd.removeClass("inactive").off("click").on("click", $this.closeChatConfirm());
		}
	}

    
	//상용구
    initBoilerplateCombo(boilerplateList) {  
        const boilerplateCombo = $('#boilerplate_combo');

        for(let i in boilerplateList) {
            const boilerplate = boilerplateList[i];
            boilerplateCombo.append(`<option value="${boilerplate.blrpltContent}">${boilerplate.blrpltTitle}</option>`);
        }

        boilerplateCombo.on('click', function() {
			const val = this.value ?? "";
			$("#textarea").val(val);
        });
    }
	//채팅 로그
    initChatLogList(chatLogList, isStart) {
		const $this = this;
		
        $('.old_chatign_unfold_bu').click(function() {
            $('.old_chatign_wrap').toggleClass('active');
            
            if($('.old_chatign_wrap').hasClass("active")) {
				var mesgs = $('.old_chatign_wrap');
				mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
			}
        });

        for(let i in chatLogList) {
            const chatLog = chatLogList[i];

            //if(chatLog.question) this._passTime = parseInt(new Date().getTime() - new Date(chatLog.questionDate).getTime()/1000);
			let targetViewer = chatLog.channelId == $this._channelId ? "chat_view_wrap" : "old_chatign_view";

			//채팅 시작일 때는 이 전 채팅 내역 보기에 append, 한 세션에서 두번 이상 상담 요청 시 같은 채널 아이디가 들어옴.
			if(isStart) targetViewer = "old_chatign_view";

			const questionHtml = chatLog.question && `
                <div class="chating_left_wrap">
                    <div class="chat_balloon left">${chatLog.question}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(chatLog.questionDate).format($this._chatDateFormat)}</span>
                    </div>
                </div>`;

            const replyHtml = chatLog.reply && `
                <div class="chating_right_wrap">
                    <div class="chat_balloon right">${chatLog.reply}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(chatLog.replyDate).format($this._chatDateFormat)}</span>
                    </div>
                </div>`;
			//file_msg = this.getFileList(contents);


			chatLog.regDate = chatLog.questionDate ? chatLog.questionDate : chatLog.replyDate;
			const attachHtml = chatLog.attachFiles && this.getFileList(chatLog);

            $('.'+targetViewer).append(questionHtml).append(replyHtml).append(attachHtml);

			//var mesgs = $('.'+targetViewer);
			//mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
        }
		//채팅 대화내역 시스템 메시지
		if( $('.old_chatign_view').html() != "" ) {
			$('.old_chatign_view').append(`<div class="chat_system_line">
                <span class="chat_system_text_2">세션 유지한 대화내역만 표시됩니다.</span>
            </div>`);
		}
		$(".old_chatign_view").scrollTop($(this).prop('scrollHeight') - $(this).prop('clientHeight'));
    }
    //상담종료  confirm 메시지
    closeChatConfirm() { 
		const $this = this;
		uiConfirm("채팅종료 시 고객과 진행중인 채팅이<br>종료됩니다.<br>채팅을 종료 하시겠습니까?", function() {
			$this.autoMsgSend("CLOSE");
		});
	}
	
	autoMsgSend(reqTypeCd) {
		//console.log("autoMsgSend : " , reqTypeCd)
		const data = {
            groupId : this._channelId,
            loginId : this._loginId,
			cusSessionId: this._cusSessionId,
            sender : "USER",
            msg :"",
            reqTypeCd : reqTypeCd,
            userGrp 	: this._userGrp,
			serviceGrpCd : this._serviceGrpCd
        };
		window.parent.customerStomp.send(data);
	}
	
    //구독취소
    unsubscribe(channelId) { 
		if(!channelId) channelId = this._channelId;
		document.getElementById("textarea").readOnly = true;
		try {
			window.parent.customerStomp.unsub(channelId);
		} catch(e) {
			
		}
	}
	//메시지 보내기
	send(data) { 
		window.parent.customerStomp.send(data);	
	}
	
	appendMsg(contents) {
		const $this = this;
		const direction = contents.sender == "USER" ? 'right' : 'left';
       	let html = "";
		let file_msg = "";
       	//시스템 메시지일 경우  
       	if(contents.sysMsgYn == "Y") {
			html = `<div class="chat_system_line">
                <span class="chat_system_text_2">${contents.msg}</span>
            </div>`;   
		} else {
			if(contents.msg) {
				html = `
				<div class="chating_${direction}_wrap">
					<div class="chat_balloon ${direction}">${contents.msg}</div>
					<div class="chat_balloon_text_wrap">
						<span class="chat_balloon_text">${new Date(contents.regDate).format($this._chatDateFormat)}</span>
					</div>
				</div>`;
			}

			if(contents.attachFiles) file_msg = this.getFileList(contents);
		}
		if(html) $('.chat_view_wrap').append(html);
		if(file_msg) $('.chat_view_wrap').append(file_msg);
	}

	getFileList(contents) {

		const attachFiles = contents.attachFiles;

		const $this = this;
		let attachObj;
		if(attachFiles) {
			attachObj = $(`<div class="user_file_container">
				<div class="user_file_box">
				</div>
			</div>
			`);

			$(attachFiles).each(function(idx, obj) {

				const extension = obj.orgFileName.split(".").pop();
				const tmpFileName = obj.orgFileName.replace("."+extension, "");
				const fileObj = $(`<div class="user_file_wrap">
						<div class="user_file_icon file"></div>
						<div class="user_file_name">${tmpFileName}</div>
						<span>[.${obj.fileExt}, ${Math.ceil(obj.fileSize/1024)}KB] </span>
					</div>`);

				if(obj.isDown !== false) {
					fileObj.css("cursor", "pointer").on("click", function() {
						$this.chatFileDownload(obj.path, obj.serverFileName, obj.orgFileName);
					});
				}
				$(attachObj).find(".user_file_box").append(fileObj);

			});

			$(attachObj).append(`<div class="chat_balloon_text_wrap">
						<span class="chat_balloon_text">${new Date(contents.regDate).format($this._chatDateFormat)}</span>
					</div>`);

		}

		return attachObj;
		//if(file_msg) $(targetObj).append(file_msg);
	}
	chatFileDownload(path, name, orgName) {
		getChatFile(path, name, orgName);
	}
	//구독
    subscribe(callback) {
		unsubscribe(this._channelId); //구독 취소 
		document.getElementById("textarea").readOnly = false;
		const $this = this;
		window.parent.customerStomp.sub(this._channelId, (data) => {
			const contents = JSON.parse(data.body);
			if(this._preGroupId == contents.groupId) return; //고객 bot 연결이 끊겼을 때 bot gruopId로 연결 끊김 메시지가 들어와서 차단함.
			
			/*
			if(contents.sender == "BOT") { // && contents.msg == "연결 되었습니다."
				setTimeout(function() {
					$this.autoMsgSend("START_MSG");
				}, 1000);
			}
			*/
			$this.appendMsg(contents);
			/*
            const direction = contents.sender == "USER" ? 'right' : 'left';
           	let html = "";

           	//시스템 메시지일 경우
           	if(contents.sysMsgYn == "Y") {
				html = `<div class="chat_system_line">
	                <span class="chat_system_text_2">${contents.msg}</span>
	            </div>`;
			} else {
				html = `
                <div class="chating_${direction}_wrap">
                    <div class="chat_balloon ${direction}">${contents.msg}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(contents.regDate).format("TT HH:MM")}</span>
                    </div>
                </div>`;
			}
           	$('.chat_view_wrap').append(html);
           	*/

            //채팅종료
            if(contents.reqTypeCd == "END") {
				document.getElementById("textarea").readOnly = true;
				this.unsubscribe(this._channelId);
				$("#fillAttachReq").addClass("display_none");
				
				//경과시간 종료
				try {
					clearInterval(timeIntervalId);
				} catch(e) {
					
				}
			} else {
				if(contents.isMsgSent === false && contents.sender == "USER") {
					uiAlert("고객과의 채팅연결이 끊겨서 메시지가 전달되지 않았습니다.");
				}
			}
            
            //채팅 읽음처리
            if(contents.sender == "CUST") {
				//this._passTime = parseInt(new Date().getTime() -new Date(contents.regDate).getTime()/1000);
				try {
					if(!$(parent.document).find("div[id=cnslChat_"+this._assignOId+"]").hasClass("display_none")) {
		            	 updateChatToRead(contents.groupId);
		            }
	            } catch(e) {
					
				}
	            
            }

            //스크롤바 제일 밑으로 이동
            /*
            setTimeout(function() {
				var mesgs = $('.chat_view_wrap');
				mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
			}, 100);
			*/

            //groupId 변경 시 채널 재구독
            if(contents.groupId != this._channelId) {
				this._preGroupId = this._channelId;
				this.unsubscribe(this._channelId);
				this._channelId = contents.groupId;
				this.subscribe();
			}
        }, {"id":this._channelId}, callback);
    }

	filterPrhbWord(msg) {
		let prhbWordList = window.localStorage.prohibitedWords;
		if(!prhbWordList) return false;
		else {
			prhbWordList = prhbWordList.split(",");
			for(let i in prhbWordList) {
				if(msg.indexOf(prhbWordList[i]) > -1) {
					uiAlert("금칙어가 포함되어 있습니다.");
					return true;
				}
			}
		}
	}
}