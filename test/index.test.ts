import { strict as assert } from "assert";
import * as path from "path";
import { loadCosmiConfig } from "../src/index";

const fixture = path.join(__dirname, "fixtures");

describe("cosmiconfig", () => {
  it("should load config from package.json", async () => {
    const config = await loadCosmiConfig("foo", path.join(fixture, "pkg-json"));
    assert.deepStrictEqual(config, { bar: 123 });
  });

  it("should load from foo.config.js", async () => {
    const config = await loadCosmiConfig(
      "foo",
      path.join(fixture, "config-js")
    );
    assert.deepStrictEqual(config, { foo: 123 });
  });

  it("should load from foo.config.cjs", async () => {
    const config = await loadCosmiConfig(
      "foo",
      path.join(fixture, "config-cjs")
    );
    assert.deepStrictEqual(config, { foo: 123 });
  });

  // This test doesn't work when ts-node is loaded as it rewrites all
  // dynamic import statements
  it.skip("should load from foo.config.mjs", async () => {
    const config = await loadCosmiConfig(
      "foo",
      path.join(fixture, "config-mjs")
    );
    assert.deepStrictEqual(config, { foo: 123 });
  });

  it("should load from foo.config.ts", async () => {
    const config = await loadCosmiConfig(
      "foo",
      path.join(fixture, "config-ts")
    );
    assert.deepStrictEqual(config, { foo: 123 });
  });
});
