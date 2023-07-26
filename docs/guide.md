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

> The configuration is required only in [Extra Data Mode](https://github.com/kaltura/playkit-js-seo/blob/master/README.md#extra-data-mode)

- **baseSegmentsUrl:**  A URL that points to a specific segment(chapter) in the video corresponding to the time offset specified in the query parameter.

**The clip URL must point to the same URL path as the video!**

For example, the following URL means the video starts at 2:00 minutes: `"https://www.example.com/example?t=120"`,

So you need to supply: `'https://www.example.com/example?t='`

And the plugin would concatenate the startTime according the chapters' entry metadata (see example [here](https://github.com/kaltura/playkit-js-seo/blob/master/demo/canary/index.html#L29))

## Full working code example

You can find Full working example [here](https://github.com/kaltura/playkit-js-seo/tree/master/demo/canary/)

## Live demo

[demo](https://kaltura.github.io/playkit-js-seo/demo/canary/index.html)