

var s = document.createElement("script");
s.src = chrome.extension.getURL("content/injection.js");

(document.body || document.head || document.documentElement).appendChild(s);

var port = chrome.extension.connect();
document.addEventListener('myCustomEvent', function() {
  console.log('myCustomEvent triggered');
    
  chrome.runtime.sendMessage({url: document.location.href}, function(response) {
    console.log("[+] Response: ", response);
  });
});

