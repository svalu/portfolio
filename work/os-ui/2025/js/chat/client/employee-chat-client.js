function getChannel(data) {
    const url = '/rest/api/employee/channel:retrieve';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    return axios.post(url, data, config);
}

function changeStatusToRead(data) {
	const url = '/rest/api/employee/chat/'+data+'/status';
    //const url = '/rest/api/employee/chat/status';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    return axios.put(url, {}, config);
}

function changeChatLogListStatusToRead(channelObjId) {
	const url = '/rest/api/employee/chat/list/'+channelObjId+'/status';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    return axios.put(url, {}, config);
}

function getChatLogList(data) {
    const url = '/rest/api/employee/chat/list:retrieve';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    return axios.post(url, data, config);
}