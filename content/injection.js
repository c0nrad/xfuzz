var oldAlert = window.alert;

window.alert = function() {
  console.log("alert triggered", document.location.href)

  var customEvent = document.createEvent('Event');
  customEvent.initEvent('myCustomEvent', true, true);

  document.dispatchEvent(customEvent);

  return oldAlert.apply(this, arguments);
}


console.log("[+] New alert handler has been binded");

