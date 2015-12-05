chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    var out = [];

    if (details.type !== 'main_frame') {
      return;
    }

    var matches = details.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];

    if (domain === null) {
      return;
    }


    out.push({name: "X-XSS-Protection", value: "0"});

    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (details.responseHeaders[i].name.toLowerCase() === 'x-xss-protection') {
        continue;
      }
      out.push(details.responseHeaders[i]);
    }
    return { responseHeaders: out };
  }, { urls: [ '<all_urls>']}, [ 'blocking', 'responseHeaders']);

