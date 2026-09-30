import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const SECRET_BASENAME_RE = /^(?:\.env(?:\..*)?|credentials?(?:\.[^.]+)?|secrets?(?:\.[^.]+)?|service[-_]?account(?:[-_].*)?\.json|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|.*\.(?:pem|p12|pfx|key|kdbx))$/i;

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function assertNotSecretFilePath(filePath) {
  if (path.normalize(filePath).split(path.sep).some(part => SECRET_BASENAME_RE.test(part))) {
    throw new Error(`Secret-file input is not allowed: ${filePath}`);
  }
}

/** Load scenario context only from regular, non-secret files within the scenario directory. */
export async function loadSafeContextFiles(contextFiles, scenarioFilePath) {
  if (!Array.isArray(contextFiles) || contextFiles.some(file => typeof file !== 'string' || !file.trim())) {
    throw new Error('inputs.context_files must be an array of non-empty file paths.');
  }

  const root = path.dirname(path.resolve(scenarioFilePath));
  const canonicalRoot = await realpath(root);
  const context = [];
  for (const file of contextFiles) {
    if (path.isAbsolute(file) || path.win32.isAbsolute(file) || /^[a-z]:/i.test(file)) {
      throw new Error(`Absolute context path is not allowed: ${file}`);
    }
    assertNotSecretFilePath(file);
    const resolved = path.resolve(root, file);
    if (!isWithin(root, resolved)) {
      throw new Error(`Context path leaves the scenario directory: ${file}`);
    }
    let canonicalFile;
    try {
      canonicalFile = await realpath(resolved);
    } catch (error) {
      if (error?.code === 'ENOENT') throw new Error(`Context file not found: ${file}`);
      throw error;
    }
    if (!isWithin(canonicalRoot, canonicalFile)) {
      throw new Error(`Context path leaves the scenario directory: ${file}`);
    }
    assertNotSecretFilePath(canonicalFile);
    if (!(await stat(canonicalFile)).isFile()) {
      throw new Error(`Context path is not a regular file: ${file}`);
    }
    context.push({ name: file, text: await readFile(canonicalFile, 'utf8') });
  }
  return context;
}
