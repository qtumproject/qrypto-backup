# Build Chrome Extension with React + Webpack + Typescript + Hot-Reloading

## Development

Install dependencies:

```bash
yarn
```

Start hot-reload compiling:

```bash
yarn start
```

Install the `dist` directory as unpacked extension:

See [Getting Started Tutorial](https://developer.chrome.com/extensions/getstarted#manifest)

## Build

> *NOTE: For security reasons, you should remove or change `content_security_policy` field in manifest.json before you publish the extension*

```bash
yarn build
```
