# Audion: Web Audio Graph Visualizer

[![Node.js CI](https://github.com/GoogleChrome/audion/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/GoogleChrome/audion/actions/workflows/nodejs-ci.yml)

Audion is a Chrome extension that adds a panel to DevTools. This panel
visualizes the audio graph (programmed with Web Audio API) in real-time.
Soon you will be able to install the extension from Chrome Web Store page.

![Google Doodle Hiphop](https://raw.githubusercontent.com/GoogleChrome/audion/main/images/hiphop-doodle.png)

## Usage

1. [Install the extension](https://chrome.google.com/webstore/detail/audion/cmhomipkklckpomafalojobppmmidlgl)
   from Chrome Web Store.
   1. Alternatively, you can clone this repository and build the extension
      locally. Follow
      [this instruction](https://developer.chrome.com/docs/extensions/mv3/faq/#faq-dev-01)
      to load the local build.
1. [Open Chrome Developer Tools](https://developer.chrome.com/docs/devtools/open/).
   You should be able to find “Web Audio” panel in the top. Select the panel.
1. Visit or reload a page that uses Web Audio API. If the page is loaded before
   opening Developer Tools, you need to reload the page for the extension to
   work correctly.
1. You can pan and zoom with the mouse and wheel. Click the “autofit” button to
   fit the graph within the panel.

## Development

### Build and test the extension

1. Install NodeJS 14 or later.
1. Install dependencies with `npm ci` or `npm install`.
1. Run `npm test` to build and test the extension.

#### Install the development copy of the extension

1. Open `chrome://extensions` in Chrome.
1. Turn on `Developer mode` if it is not already active.
1. Load an unpacked extension with the `Load unpacked` button. In the file
   modal that opens, select the `audion` directory inside of the `build`
   directory under the copy of this repository.

#### Use and make changes to the extension

1. Open the added `Web Audio` panel in an inspector window with a page that
   uses Web Audio API.
1. Make changes to the extension and rebuild with `npm test` or `npm run build`.
1. Open `chrome://extensions`, click `Update` to reload the rebuilt extension.
   Close and reopen any tab and inspector to get the rebuilt extension's panel.

### Use extra debugging information

1. Open the extension option panel and check "Click here to show more debug
   info".
2. Right click the visualizer panel and click "Inspect" to the extension's
   DevTools panel, and see the console for the extra debugging information.

## Acknowledgments

Special thanks to [Chi Zeng](https://github.com/chihuahua) (Google),
[Gaoping Huang](https://github.com/gaopinghuang0),
[Michael "Z" Goddard](https://github.com/mzgoddard)
([Bocoup](https://bocoup.com/)) and
[Tenghui Zhang](https://github.com/TenghuiZhang) for their contribution on this
project.

## Contribution

If you have found an error in this library, please file an issue at:
https://github.com/GoogleChrome/audion/issues.

Patches are encouraged, and may be submitted by forking this project and
submitting a pull request through GitHub. See CONTRIBUTING for more detail.

## License

Copyright 2021 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
