import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = mkdtempSync(join(tmpdir(), "ulsan-tourapi-"));
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
try {
  const compiled = run([
    "node_modules/typescript/bin/tsc", "src/lib/tourapi-photos.test.ts",
    "--outDir", output, "--module", "commonjs", "--target", "es2017",
    "--esModuleInterop", "--strict", "--skipLibCheck",
  ]);
  process.exitCode = compiled || run(["--test", join(output, "lib/tourapi-photos.test.js")]);
} finally {
  rmSync(output, { recursive: true, force: true });
}
