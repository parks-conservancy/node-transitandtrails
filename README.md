# transitandtrails

I am a Node.js client for the [Transit
& Trails](http://www.transitandtrails.org/) API.

## Installation

```bash
npm install transitandtrails
```

## Usage

```javascript
var TransitAndTrails = require("transitandtrails");

var tnt = new TransitAndTrails({
  key: "<API key>"
});

tnt.getTrailhead(292, function(err, trailhead) {
  if (err) {
    throw err;
  }

  console.log(trailhead);
};
```

## Environment Variables

* `TNT_API_KEY` - (optional) API key.
* `TNT_URL_PREFIX` - (optional) alternate URL prefix. Defaults to
  `https://www.transitandtrails.org`.

## License

Copyright (c) 2013 Seth Fitzsimmons

Published under the MIT license.
