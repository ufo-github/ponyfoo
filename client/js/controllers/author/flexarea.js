
  var textarea, staticOffset;
  var iLastMousePos = 0;
  var iMin = 32;
  var grip;

  function startDrag (e) {
    textarea = $(e.data.el);
    textarea.blur();
    iLastMousePos = mousePosition(e).y;
    staticOffset = textarea.height() - iLastMousePos;
    textarea.addClass('resizing');
    $(document).mousemove(performDrag).mouseup(endDrag);
    return false
  }

  function performDrag (e) {
    var iThisMousePos = mousePosition(e).y;
    var iMousePos = staticOffset + iThisMousePos;
    if (iLastMousePos >= (iThisMousePos)) {
      iMousePos -= 5
    }
    iLastMousePos = iThisMousePos;
    iMousePos = Math.max(iMin, iMousePos);
    textarea.height(iMousePos + 'px');
    if (iMousePos < iMin) {
      endDrag(e)
    }
    return false
  }

  function endDrag (e) {
    $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
    textarea.removeClass('resizing');
    textarea.focus();
    textarea = null;
    staticOffset = null;
    iLastMousePos = 0
  }

  function mousePosition (e) {
    return {
      x: e.clientX + document.documentElement.scrollLeft,
      y: e.clientY + document.documentElement.scrollTop
    }
  }
})(jQuery);

module.exports = function (textarea) {
  var wrapper = document.createElement('div');
  var grip = document.createElement('div');

  textarea.classList.add('fl-textarea');
  textarea.parentNode.replaceChild(wrapper, textarea);
  wrapper.appendChild(textarea);
  wrapper.appendChild(grip);
  wrapper.classList.add('fl-wrapper');
  grip.classList.add('fl-grip');
  grip.addEventListener('mousedown', startDrag);
  grip.style.marginRight = (grip.offsetWidth - textarea.offsetWidth) + 'px';
};
