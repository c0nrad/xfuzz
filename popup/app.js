var app = angular.module('xfuzz', [])


app.controller('HomeController', function($scope, Fuzzer, Payloads, DefaultConfig) {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    $scope.url = tabs[0].url;
    $scope.testcases = Payloads.GenerateTestcases($scope.url, $scope.includeCommonQuery, $scope.fuzzPattern)
    $scope.$apply()
    $scope.$watchGroup(['incluedCommonQuery', 'fuzzPattern', 'url'], function(newValues, oldValues) {
      console.log("Updating testcases");
      $scope.testcases = Payloads.GenerateTestcases($scope.url, $scope.includeCommonQuery, $scope.fuzzPattern)
    })
  })

  // Default Config
  $scope.numberOfTabs = DefaultConfig.numberOfTabs
  $scope.delayTime = DefaultConfig.delayTime
  $scope.includeCommonQuery = DefaultConfig.includeCommonQuery
  $scope.fuzzer = Fuzzer

  $scope.numberCompleted = 0

  $scope.fuzz = function() {
    Fuzzer.Fuzz($scope.testcases.slice(0), $scope.numberOfTabs, $scope.delayTime)
  }
})

app.value('DefaultConfig', {
    numberOfTabs: 2,
    delayTime: 1000,
    includeCommonQuery: true,
});

app.factory("Payloads", function() {
  var out = {};
  var payloads = ["<img onerror=prompt(1) src=x>", "javascript://'/</title></style></textarea></script>--><p\" onclick=alert()//><img onerror=prompt(1) srx=x>*/alert()/*",
"--></script></title></style>\"/</textarea><a' onclick=alert()//><img onerror=prompt(1) srx=x>*/alert()/*", "'; alert(1)"]
  var commonQuery = ['admin', 'tag', 'id', 'user', 'userid', 'debug', 'page', 'redirect', 'next', 'callback', 'q']

  function buildURL(base, params) {
    return base + _.map(params, function(value, key) { return key+"="+value}).join('&')
  }

  function GenerateTestcases(url, includeCommon) {
    console.log(url, includeCommon)
    var u = new URL(url)
    var base = u.origin + u.pathname + "?"
    var querystring = u.search.substring(1)

    var paramMap = {}
    if (includeCommon) {
      for (var i = 0; i < commonQuery.length; ++i) {
        paramMap[commonQuery[i]] = 'test';
      }
    }


    if (querystring.length != 0) {
      var params = querystring.split('&')
      for (var i = 0; i < params.length; i++) {
        var key = params[i].split('=')[0]
        var value = params[i].split('=')[1]
        paramMap[key] = value
      }
    }

    var out = [];
    _.each(payloads, function(payload, index) {
      _.each(paramMap, function(value, key) {
        var testcase = _.clone(paramMap)
        var oldValue = testcase[key]

        //replace
        testcase[key] = payload
        out.push(buildURL(base, testcase))

        //before
        testcase[key] = payload + oldValue
        out.push(buildURL(base, testcase))

        //after
        testcase[key] = oldValue + payload
        out.push(buildURL(base, testcase))

        //middle
        var middle = oldValue.length/2;
        testcase[key] = oldValue.substring(0, middle) + payload + oldValue.substring(middle)
        out.push(buildURL(base, testcase))
      })
    })
    return out;
  }
  out.paylods = payloads;
  out.GenerateTestcases = GenerateTestcases
  return out
})

app.factory('Fuzzer', function($rootScope, $timeout) {

  var out = {
    completed: 0,
    testcases: []
  };

  function FuzzNextPayload(tabId) {
    if (out.testcases.length > 0) {
      var testcase = out.testcases.pop()
      console.log("[+] Next testcase", testcase)
      chrome.tabs.update(tabId, {url: testcase});
    } 
  }

  function Fuzz(testcases, numberOfTabs, delayTime, fuzzPattern) {
    out.completed = 0;
    out.testcases = testcases;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      var tab = tabs[0]
      var url = tab.url;

      chrome.windows.create({left: 25, top: 100, width: 200, height: 200, focused: false}, function(fuzzWindow) {
        var fuzzTabs = []
        for (var i = 0; i < numberOfTabs; i++) {
          chrome.tabs.create({windowId: fuzzWindow.id}, function(fuzzTab) {
            var tabId = fuzzTab.id
            console.log("[+] created new fuzzing tab", fuzzTab);
            fuzzTabs.push(fuzzTab.id);
            out.completed -=1; // completed will be called an extra time per tab on startup
          });
        };

        chrome.tabs.onUpdated.addListener(function(tabId, info) {
          if (_.contains(fuzzTabs, tabId) && info.status == "complete") {
            console.log(tabId, info);

            out.completed += 1
            $rootScope.$apply();
            $timeout(function() {
              FuzzNextPayload(tabId)
            }, parseInt(delayTime))
          }
        })
      });
    });
  }

  out.Fuzz = Fuzz
  out.FuzzNextPayload = FuzzNextPayload
  return out
})


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });