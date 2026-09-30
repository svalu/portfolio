/* 제품 UI에서 공개 체험으로 들어오고 나가는 길만 보완한다. */
$(function () {
    if (document.getElementById('userId')) {
        document.body.classList.add('demo-login');
        $('#userId').val('demo');$('#password').val('demo2025');
        $('#saveUserIdCheck').prop('checked', false);
        var original = window.openPwFindPop;
        window.openPwFindPop = function () {
            original();
            $('#findPw_id').val('demo').prop('readOnly',true);
            $('#findPw_name').val('김상담').prop('readOnly',true);
            $('#findPw_email').val('demo@example.com').prop('readOnly',true);
            $('#sendEmailBtn').trigger('focus');
        };
    }
});
