// inject code copy-to-clipboard button

try {
  var CODE_CLASS = 'copy-button';
  var codeElements = document.getElementsByTagName('code');

  for (var i = 0; i < codeElements.length; i++) {
    var codeElement = codeElements[i];
    var preElement = codeElement.parentNode;
    if (preElement.tagName === 'PRE') {
      var parent = codeElement.parentNode.parentNode;
      var codeText = (codeElement.innerText || '').replace(/"/gm, '\\"').replace(/\n*$/, '');
      const container = document.createElement('DIV');
      container.setAttribute('class', 'code');

      var button = document.createElement('BUTTON');
      button.setAttribute('class', CODE_CLASS);
      button.setAttribute('data-clipboard-text', codeText);
      button.innerText = 'copy';

      parent.replaceChild(container, preElement);
      container.appendChild(button);
      container.appendChild(preElement);
    }
  }

  new ClipboardJS('.' + CODE_CLASS);
} catch (e) {
  console.warn('Cannot inject copy-to-clipboard button:', e);
}
