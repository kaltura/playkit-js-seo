[![Build Status](https://github.com/kaltura/playkit-js-seo/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/playkit-js-seo/actions/workflows/run_canary_full_flow.yaml)
[![](https://img.shields.io/npm/v/@playkit-js/seo/latest.svg)](https://www.npmjs.com/package/@playkit-js/seo)
[![](https://img.shields.io/npm/v/@playkit-js/seo/canary.svg)](https://www.npmjs.com/package/@playkit-js/seo/v/canary)

# playkit-js-seo

**playkit-js-seo** is a [kaltura player] plugin that provides search engine optimization (SEO) capabilities for video content played by [kaltura player] SDK and managed in [Kaltura Management Console (KMC)].
It integrates structured data (Schema.org) into the player to improve discoverability and visibility of video content on search engines.

This plugin automatically generates structured data based on the video metadata, including properties such as
name, description, thumbnail URL, upload date, expiration date, duration, transcript, and chapters (if available). The structured data is then
either injected directly into the player or communicated to the parent frame if the player is embedded within an iframe.

By incorporating structured data, the plugin helps search engines understand and interpret video content more effectively. 
This can lead to improved SEO rankings and enhanced visibility in search engine results.

It relies on [kaltura player] core API for getting video metadata and listing for player events.

playkit-js-seo is written in [TypeScript] (`*.ts`) (strongly typed superset of ES6), and transpiled in ECMAScript5 using [Webpack].

[Webpack] is used to build the distro bundle and serve the local development environment.

[kaltura player]: https://github.com/kaltura/kaltura-player-js.
[Kaltura Management Console (KMC)]: https://corp.kaltura.com/resources/case-studies/kaltura-management-console-kmc-walkthrough/.
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[typescript]: https://www.typescriptlang.org/
[typescript compiler]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[webpack]: https://webpack.js.org/

## Features

The plugin can be activated in two modes:

### Basic Player Metadata (No Configuration Required)
In this mode, the SEO plugin will automatically generate structured data based on the basic video metadata, 
including properties such as name, description, thumbnail URL, upload date, expiration date, and duration.

- **This mode requires no additional configuration nor any additional dependency** and works out of the box.

### Extra Data Mode
In this mode, the SEO plugin includes **Chapters** and **Transcript** properties in the structured data.
**Chapters** enables key moments feature which is a way for users to navigate video segments like chapters in a book, 
which can help users engage more deeply with your content. **Transcript** provides richer search results with relevant keywords
This mode requires:

- **baseSegmentsUrl configuration**. A URL that points to a specific segment(chapter) in the video corresponding to the time offset specified in the query parameter.
   The clip URL must point to the same URL path as the video with additional query parameters that specify the time (see [here](https://github.com/kaltura/playkit-js-seo/blob/master/docs/guide.md#configuration) for more details).

- Set the player's **'preload'** option in the playback config to **'auto'** (config.playback.preload = auto).

- **Cue Points Manager Dependency**: The plugin depends on the [Cue Points Manager plugin](https://github.com/kaltura/playkit-js-kaltura-cuepoints)
  to handle the cue points for chapters and transcript.
  Make sure the Cue Points Manager package is included and properly integrated into your application
  and configurd in plugins section in player config.

## Iframe embed VS Dynamic embed

The generated SEO structured data is either injected directly into the player 
or communicated to the parent frame if the player is embedded within an iframe,

In the latter, a supplementary code integration is required to be added on the parent frame (see [Customers Integration Guide](./docs/integration-guide.md))

## The Generated JSON-LD Data Structure

the generated SEO data to be injected would look like this:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Nice Video Clip",
  "description": "",
  "thumbnailUrl": "https://cfvod.kaltura.com/p/1887631/sp/1765100/thumbnail/entry_id/1_r62bdgz/version/100222/height/360/width/640",
  "uploadDate": "2016-09-27T07:09:43+00:00",
  "duration": "PDT00H12M21S",
  "contentUrl": "https://cdnapisec.kaltura.com/p/4587/sp/479/playManifest/entryId/1_z63gj3gz/protocol/https/format/mpegdash/1_e4myapi8/a.mpd",
  "expires": "2040-12-26T09:07:18+00:00",
  "hasPart": [
    {
      "@type": "Clip",
      "name": "chapter 1",
      "startOffset": 0,
      "endOffset": 24,
      "url": "https://www.example.com/example?t=0"
    },
    {
      "@type": "Clip",
      "name": "chapter 2",
      "startOffset": 24,
      "endOffset": 700,
      "url": "https://www.example.com/example?t=24.101"
    }
  ],
  "transcript": "The grass is always greener on the other side of the fence..."
}
```

## Getting started with development

```sh
# First, checkout the repository and install the required dependencies
git clone https://github.com/kaltura/playkit-js-seo.git

# Navigate to the repo dir
cd playkit-js-seo

# Run dev-server for demo page (recompiles on file-watch, and write to actual dist fs artifacts)
npm run dev

# Before submitting a PR - Run the pre commit command
npm run pre:commit

# this command will run:

# 1. types check
# 2. lint check
# 3. generate/update types
# 4. generate/update docs
```

The dev server will host files on port 8000. Once started, the demo can be found running at http://localhost:8000/.

Before submitting a PR, please see our [contribution guidelines](CONTRIBUTING.md).


### Linter (ESlint)

Run linter:

```
npm run lint:check
```

Run linter with auto-fix mode:

```
npm run lint:fix
```

### Formatting Code

Run prettier to format code

```
npm run prettier:fix
```

### Type Check

Run type-check to verify TypeScript types

```
npm run types:check
```

### Automated tests (Mocha/Karma)

Run all tests at once:

```
npm test
```

Run unit tests in watch mode:

```
npm run test:watch
```

## Design

An overview of this project's design, can be found [here](https://kaltura.atlassian.net/wiki/spaces/PROD/pages/3554412657/Side+Panel+Manager+-+Design+Document).

## API Docs

[API docs](https://kaltura.github.io/playkit-js-seo/docs/api/index.html)

## Usage Guide (for Playkit Maintainers)

[Usage Guide](./docs/guide.md)

## Customers Integration Guide

[Customers Integration Guide](./docs/integration-guide.md)

## Demo

[https://kaltura.github.io/playkit-js-seo/demo/canary/index.html](https://kaltura.github.io/playkit-js-seo/demo/canary/index.html)


## Compatibility

playkit-js-seo is only compatible with browsers supporting MediaSource extensions (MSE) API with 'video/MP4' mime-type inputs.

playkit-js-seo is supported on:

- Chrome 39+ for Android
- Chrome 39+ for Desktop
- Firefox 41+ for Android
- Firefox 42+ for Desktop
- IE11 for Windows 8.1+
- Edge for Windows 10+
- Safari 8+ for MacOS 10.10+
- Safari for ipadOS 13+

## License

playkit-js-seo is released under [Apache 2.0 License](LICENSE)