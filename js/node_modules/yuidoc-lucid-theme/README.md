# yuidoc-lucid-theme

A simple [YUIDoc](http://yui.github.io/yuidoc/) theme for single-module libraries. Based off [yuidoc-bootstrap-theme](https://github.com/kevinlacotaco/yuidoc-bootstrap-theme).

```sh
$ npm install yuidoc-lucid-theme
```

[**Live Example**](http://naturalatlas.github.io/node-gdal/classes/gdal.html)

## Configuration 

### Command-Line

When running yuidoc directly from the command line without a configuration file, specify the theme with the following two arguments:

 - `-t` Theme directory 
 - `-H` Template helpers

```sh
$ yuidoc -t node_modules/yuidoc-lucid-theme -H node_modules/yuidoc-bootstrap-theme/helpers/helpers.js
```

### Configuration File

If your project uses a "yuidoc.json" file for configuration, add:

```js
"themedir" : "node_modules/yuidoc-lucid-theme",
"helpers" : ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"]
```

Example:

```json
{
    "name": "Example",
    "url": "www.example.com",
    "version": "0.1.0",
    "options": {
        "paths": "_location to parse_",
        "outdir": "build/docs",
        "exclude": "lib,docs,build",
        "themedir": "node_modules/yuidoc-lucid-theme",
        "helpers": ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"]
    }
}
```

## License

The MIT License (MIT)

Copyright (c) 2014 [Kevin Lakotko](https://github.com/kevinlacotaco), [Tony Barone](https://github.com/tonybaroneee), [Brian Reavis](https://github.com/brianreavis)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.