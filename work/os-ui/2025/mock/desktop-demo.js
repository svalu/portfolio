/* A deliberate route to the original 404 design, without discarding open work. */
(() => {
  const id='demo-error';
  function openError(){
    const existing=document.getElementById(id);
    if(existing){existing.classList.remove('display_none');iframeWindow.focus($(existing));return $(existing);}
    const host=assignDragFunction({menuId:id,menuName:'404 · 잠깐 쉬어가기',url:'screens/error.html?embedded=1'});
    document.body.append(host[0]);windowList.push(host);
    return host;
  }
  window.CounselingDemo={openError};
  document.getElementById('demo-error-open').addEventListener('click',openError);
})();
