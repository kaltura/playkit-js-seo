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


### Basic Player Metadata (No Configuration Required)
In this mode, the SEO plugin will automatically generate structured data based on the basic video metadata, 
including properties such as name, description, thumbnail URL, upload date, expiration date, and duration.

- **This mode requires no additional configuration nor any additional dependency** and works out of the box.

### Extra Data Mode
In this **Chapters** and **Transcript** data also supplied in the seo structure data.
**Chapters** enables key moments feature which is a way for users to navigate video segments like chapters in a book, 
which can help users engage more deeply with your content, and **Transcript** provides richer search results with relevant keywords
This mode requires:

- **baseSegmentsUrl configuration**. A URL that points to a specific segment(chapter) in the video by start time query parameter.
The clip URL must point to the same URL path as the video with additional query parameters that specify the time.
For example, the following URL means the video starts at 2:00 minutes: _**"https://www.example.com/example?t=120"**_, 
so you need to supply: `{baseSegmentsUrl: "https://www.example.com/example?t="}` 
and the plugin would concatenate the startTime according the chapters' metadata of the entry (see example [here](https://github.com/kaltura/playkit-js-seo/blob/master/demo/canary/index.html#L29))
- 
- **The player _'preload'_** option in playback config to be set to _'auto'_ (config.playback.preload = auto).
- **Cue Points Manager Dependency**: The plugin depends on the Cue Points Manager package
  to handle the cue points for chapters and transcript. 
 Make sure the Cue Points Manager package is included and properly integrated into your application
and configurd in plugins section in player config.

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

## API docs

[API docs](https://kaltura.github.io/playkit-js-seo/docs/api/index.html)

## Usage guide

[usage guide](./docs/guide.md)

## Demo

[https://kaltura.github.io/playkit-js-seo/demo/index.html](https://kaltura.github.io/playkit-js-seo/demo/index.html)


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