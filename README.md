# Audion: A Web Audio Inpsector

## Development and Installation

#### Build and test the extension

1. Install NodeJS 14 or later.
2. Install dependencies with `npm ci` or `npm install`.
3. Run `npm test` to build and test the extension.

#### Install the development copy of the extension

1. Open `chrome://extensions` in Chrome.
2. Turn on `Developer mode` if it is not already active.
3. Load an unpacked extension with the `Load unpacked` button. In the file modal that opens, select the `audion` directory inside of the `build` directory under the copy of this repository.

#### Use and make changes to the extension

1. Open the added Web Audio panel in an inspector window with a page that uses the Web Audio api.
2. Make changes to the extension and rebuild with `npm test` or `npm run build`.
3. Open `chrome://extensions`, click `Update` to reload the rebuilt extension. Close and reopen any tab and inspector to get the rebuilt extension's panel.
