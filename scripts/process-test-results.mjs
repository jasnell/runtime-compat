// @ts-check
import { readdir, writeFile } from "node:fs/promises";
import data from "@mdn/browser-compat-data" assert { type: "json" };
import { deepCreate, get } from "./traverse-utils.mjs";
const runtimeDir = new URL("../generator/runtimes", import.meta.url);

/**
 * @param {Array<import("../vendor/types").TestResult>} results
 * @returns {Array<string>}
 */
function getSupportedApis(results) {
  const passes = [];
  for (const test of results) {
    if (test.result) {
      passes.push(test.name);
    }
  }
  return passes;
}

const keys = await readdir(runtimeDir);
/** @type {Record<string, Set<string>>} */
const support = {};
for (const key of keys) {
  const data = await import(`../generator/runtimes/${key}/data.json`, {
    assert: { type: "json" },
  });
  support[key] = new Set(getSupportedApis(data.default));
}
const union = new Set(
  Object.values(support)
    .flatMap((set) => [...set])
    .sort(),
);

const compat = {};

for (const feature of union) {
  const entry = deepCreate(compat, feature);
  if (!entry.__compat) {
    const browserCompat = get(data, `${feature}.__compat`) ?? {};
    entry.__compat = {
      ...browserCompat,
      support: Object.fromEntries(
        keys.map((key) => [
          key,
          {
            version_added: support[key].has(feature),
          },
        ]),
      ),
    };
  }
}

const runtimeTypes = keys.map((key) => `  | "${key}"`).join("\n");

await writeFile(
  new URL("../packages/runtime-compat-data/runtimes.d.ts", import.meta.url),
  /* ts */ `/**
 * The WinterCG runtime key
 */
export type RuntimeName =
${runtimeTypes};
`,
);

await writeFile(
  new URL("../packages/runtime-compat-data/data.json", import.meta.url),
  JSON.stringify(compat),
);
