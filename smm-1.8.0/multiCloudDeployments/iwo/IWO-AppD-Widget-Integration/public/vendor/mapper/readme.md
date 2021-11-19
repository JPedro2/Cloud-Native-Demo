![mappa](website/static/img/logo_small.png)

[Mappa](https://mappa.js.org/)
========

[![travis build](https://img.shields.io/travis/cvalenzuela/Mappa.svg?style=flat-square)](https://travis-ci.org/cvalenzuela/Mappa)
[![codecov coverage](https://img.shields.io/codecov/c/github/cvalenzuela/Mappa.svg?style=flat-square)](https://codecov.io/github/cvalenzuela/Mappa)
![version](https://img.shields.io/npm/v/mappa-mundi.svg?style=flat-square)

Mappa.js is a Javascript library that allows you to overlay a `<canvas>` on top of a tile map. It also provides a set of tools for working with static maps, interactive tile maps and geo-data among other tools useful when building geolocation-based visual representations.

Mappa was originally designed for [p5.js](https://github.com/processing/p5.js), but it can be used with plain Javascript or with other libraries that use the canvas element as the render object.

## Reference

- [Getting Started](https://mappa.js.org/docs/getting-started.html)
- [API Reference](https://mappa.js.org/docs/api-mappa.html)
- [Examples](https://mappa.js.org/docs/examples-google-maps.html)
- [Tutorials](https://mappa.js.org/docs/introduction-to-web-maps.html)

## Usage

Download the [full](dist/mappa.js), [minified](dist/mappa.min.js) or use the online version and add  it to the head section of the document. Mappa will automatically load the required map libraries when necessary.

```html
<script src="mappa.min.js" type="text/javascript"></script>
```
or
```html
<script src="https://cdn.jsdelivr.net/npm/mappa-mundi/dist/mappa.min.js" type="text/javascript"></script>
```

If you are using npm:
```bash
npm install mappa-mundi
```

## Licence
  MIT

## GSOC
![gsoc](website/static/img/gsoc.png)

Project developed as part of Google Summer of Code 2017