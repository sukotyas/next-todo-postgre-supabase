import { spawnSync } from "node:child_process";

function runStep(scriptName) {
  const result = spawnSync(
    process.execPath,
    ["--env-file=.env", scriptName],
    {
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runStep("scripts/migrate.mjs");
runStep("scripts/seed.mjs");
