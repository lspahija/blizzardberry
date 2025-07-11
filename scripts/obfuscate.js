/* eslint-disable @typescript-eslint/no-require-imports */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs/promises');
const path = require('path');

const scriptFilename = 'agent.js';

const scriptPath = path.join(
  __dirname,
  '..',
  '.next',
  'server',
  'public',
  'agent',
  scriptFilename
);

const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 1,
  debugProtection: true,
  debugProtectionInterval: 4000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 1,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

async function obfuscateScript() {
  console.log(`\nStarting obfuscation for: ${scriptFilename}`);

  try {
    await fs.access(scriptPath);
    const originalCode = await fs.readFile(scriptPath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      originalCode,
      obfuscationOptions
    );
    await fs.writeFile(scriptPath, obfuscationResult.getObfuscatedCode());
    console.log('Script obfuscated successfully! ✨');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: Could not find the script at: ${scriptPath}`);
    } else {
      console.error('An error occurred during obfuscation:', error);
    }
    process.exit(1);
  }
}

obfuscateScript();
