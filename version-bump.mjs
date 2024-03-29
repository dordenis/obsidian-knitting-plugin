import {
  readFile,
  writeFile
} from "fs/promises";
import process from "process";

const targetVersion = process.env.npm_package_version;
const indentSize = 2;

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(await readFile("manifest.json"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
await writeFile("manifest.json", JSON.stringify(manifest, null, indentSize));

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(await readFile("versions.json"));
versions[targetVersion] = minAppVersion;
await writeFile("versions.json", JSON.stringify(versions, null, indentSize));
