function downloadFile(url, param) {
    $.ajax ({
        url : url,
        xhr : function() {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 2) {
                    if (xhr.status == 200) {
                        xhr.responseType = "blob";
                    } else {
                        xhr.responseType = "text";
                    }
                }
            };
            return xhr;
        },
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type : 'POST',
        data : param,
        success : function(data, message, xhr) {
            showFile(data, xhr);
        }
    });
}

function showFile(data, xhr) {
    var disposition = xhr.getResponseHeader('Content-Disposition');
    var filename;
    if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) filename = decodeURI(matches[1].replace(/['"]/g, ''));
    }
    var blob = new Blob([data] );
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}