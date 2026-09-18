// 추가 프레임워크 없이 설치된 TypeScript와 Node.js 내장 테스트 러너를 사용합니다.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = mkdtempSync(join(tmpdir(), "ulsan-recommendation-"));

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

try {
  const compileStatus = run([
    "node_modules/typescript/bin/tsc", "src/lib/recommendation.test.ts",
    "--outDir", output, "--module", "commonjs", "--target", "es2017",
    "--esModuleInterop", "--strict", "--skipLibCheck",
  ]);
  process.exitCode = compileStatus || run(["--test", join(output, "lib/recommendation.test.js")]);
} finally {
  rmSync(output, { recursive: true, force: true });
}
