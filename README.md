# comsiconfig-lite

A light alternative to [cosmiconfig](https://github.com/davidtheclark/cosmiconfig). It's only purpose is to load config files from any of the following locations:

- `package.json` (`"my-module"`-key)
- `my-module.config.js`
- `my-module.config.cjs`
- `my-module.config.mjs`
- `my-module.config.ts`

## Usage

```bash
npm install cosmiconfig-lite
# or via yarn
yarn add cosmiconfig-lite
```

```js
import { loadCosmiConfig } from "cosmiconfig-lite";

async function loadConfig() {
	const config = loadCosmiConfig(
		"my-module", // your package name
		process.cwd() // path to start looking for config files
	);

	return config;
}

loadConfig();
```

## License

MIT, see [the LICENSE file](./LICENSE).
