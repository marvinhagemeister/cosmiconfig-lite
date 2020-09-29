import * as path from "path";
import * as fs from "fs";
import { pathToFileURL } from "url";

async function search(dir: string, files: string[]): Promise<string | null> {
  for (const file of files) {
    const fileName = path.join(dir, file);
    try {
      await fs.promises.access(fileName, fs.constants.F_OK);
      return fileName;
    } catch (e) {
      // File doesn't exist, traverse upwards
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
  }

  if (dir !== path.dirname(dir)) {
    return await search(path.dirname(dir), files);
  }

  return null;
}

async function readJSON(fileName: string) {
  const json = await fs.promises.readFile(fileName, "utf-8");
  return JSON.parse(json);
}

let useImport = false;
async function load(fileName: string, packageName: string) {
  // Only use import() for JavaScript files. Patching module
  // resolution of import() calls is still very experimental, so
  // tools like `ts-node´ need to keep using `require` calls.
  // Note that we still need to forward loading from `node_modules`
  // to `import()` regardless.
  if ((/\.c?js$/.test(fileName) && useImport) || /\.mjs$/.test(fileName)) {
    // Use dynamic import statement to be able to load both native esm
    // and commonjs modules.

    // If we have a an absolute path we need to convert it to a URL.
    // This is crucial for Windows support where paths are not valid
    // URL pathnames. The latter is supported by `import()` out of
    // the box.
    let urlOrModuleName = fileName;
    if (path.isAbsolute(fileName)) {
      urlOrModuleName = pathToFileURL(fileName).href;
    }

    // @ts-ignore
    const m = await import(urlOrModuleName);

    // If we're importing a commonjs file the exports will be defined
    // as an esm default export
    return m.default ? m.default : m;
  } else if (/\.json$/.test(fileName)) {
    const config = await readJSON(fileName);
    return config[packageName] || null;
  }

  const m = require(fileName);
  return m.default ? m.default : m;
}

export async function loadCosmiConfig(packageName: string, dir: string) {
  // Find `package.json` to determine the module type we're in.
  const pkg = await search(process.cwd(), ["package.json"]);
  if (pkg) {
    const pkgJson = await readJSON(pkg);
    useImport = pkgJson.type === "module";
  }

  const files = [
    "package.json",
    `${packageName}.config.js`,
    `${packageName}.config.cjs`,
    `${packageName}.config.mjs`,
    `${packageName}.config.ts`, // Most common non-native loader
  ];

  const fileName = await search(dir, files);
  if (fileName !== null) {
    return await load(fileName, packageName);
  }

  return null;
}
