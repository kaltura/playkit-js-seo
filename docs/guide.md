# usage guide

- [Getting started](#getting-started)
    - [Setup](#setup)
    - [Configuration](#configuration)
- [Full working example](https://github.com/kaltura/playkit-js-seo/tree/master/demo)

## Getting started

### Setup

First include `playkit-seo.js` **after** kaltura-player script in your web page.

```html
  <script src="https://unpkg.com/@playkit-js/kaltura-player-js@latest/dist/kaltura-ovp-player.js"></script>
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
        seo: {},
      }
    };

const player = KalturaPlayer.setup(config);
```

### Configuration

The Plugin doesn't require any configuration

## Full working code example

You can find Full working example [here](https://github.com/kaltura/playkit-js-seo/tree/master/demo/canary/)

## Live demo

[demo](https://kaltura.github.io/playkit-js-seo/demo/canary/index.html)