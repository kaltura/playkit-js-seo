# usage guide

- [Getting started](#getting-started)
    - [Setup](#setup)
    - [Configuration](#configuration)
- [Full working example](https://github.com/kaltura/playkit-js-seo/tree/master/demo)

## Getting started

### Setup

First include `playkit-seo.js` **after** kaltura-player script in your web page.

```html
  <script src="https://raw.githack.com/kaltura/kaltura-player-js/master/dist/kaltura-ovp-player.js"></script>
  <script src="./playkit-seo.js"></script>
```

Add the seo to the player config under the plugins section.

```js
    const config = {
      targetId: 'player-placeholder',
      provider: {
        partnerId: 1234567,
      },
      plugins: {
        pluginExample: {},
      }
    };

const player = KalturaPlayer.setup(config);
```

### Configuration

You can see the **Example plugin** full configuration options [here](https://kaltura.github.io/playkit-js-seo/docs/api/<PATH-TO-YOUR-CONFIGURATION-DOC-FILE>)

You can find configuration example [here](https://github.com/kaltura/playkit-js-seo/tree/master/demo/index.html)

## Full working example

You can find Full working example [here](https://github.com/kaltura/playkit-js-seo/tree/master/demo)

## API docs

[API docs](https://kaltura.github.io/playkit-js-seo/docs/api/index.html)

## Demo

[demo](https://kaltura.github.io/playkit-js-seo/demo/index.html)