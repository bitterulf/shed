const xray = require('x-ray');

xray('https://de.wikipedia.org/wiki/Wikipedia:Hauptseite', '#hauptseite-nachrichten a')(function(result) {
    console.log('zzz', result);
})
