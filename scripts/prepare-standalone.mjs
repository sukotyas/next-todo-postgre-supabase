import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const buildRoot = path.join(projectRoot, ".next");
const standaloneRoot = path.join(buildRoot, "standalone");
const standaloneNextRoot = path.join(standaloneRoot, ".next");
const staticSource = path.join(buildRoot, "static");
const staticTarget = path.join(standaloneNextRoot, "static");
const publicSource = path.join(projectRoot, "public");
const publicTarget = path.join(standaloneRoot, "public");

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyIfPresent(source, target) {
  if (!(await exists(source))) {
    return false;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, force: true });
  return true;
}

async function run() {
  const copiedStatic = await copyIfPresent(staticSource, staticTarget);
  const copiedPublic = await copyIfPresent(publicSource, publicTarget);

  if (!copiedStatic) {
    throw new Error('Missing ".next/static". Run "next build" before preparing standalone assets.');
  }

  console.log("Standalone assets prepared.");

  if (copiedPublic) {
    console.log("Public assets copied.");
  }
}

run().catch((error) => {
  console.error(`Standalone asset preparation failed: ${error.message}`);
  process.exitCode = 1;
});
