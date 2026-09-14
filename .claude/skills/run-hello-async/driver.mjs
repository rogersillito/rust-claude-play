#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const binaryPath = path.join(projectRoot, 'target', 'debug', 'hello-async.exe');

console.log('🧪 Running hello-async test suite\n');

function runTest(name, args, expectSuccess = true) {
  console.log(`📌 Test: ${name}`);
  console.log(`   Args: ${args.length > 0 ? args.join(' ') : '(none)'}`);

  try {
    const result = spawnSync(binaryPath, args, {
      timeout: 10000,
      encoding: 'utf-8',
    });

    if (result.error) {
      console.log(`   ❌ Error: ${result.error.message}`);
      return false;
    }

    const output = result.stdout.trim();
    const stderr = result.stderr.trim();
    const statusOk = result.status === (expectSuccess ? 0 : 1);

    if (!statusOk && !expectSuccess) {
      console.log(`   ✓ Got expected error:`);
      console.log(`   ${stderr.split('\n')[0]}`);
      return true;
    }

    if (!statusOk && expectSuccess) {
      console.log(`   ❌ Command failed with exit code ${result.status}`);
      if (stderr) console.log(`   Error: ${stderr}`);
      return false;
    }

    if (output) {
      console.log(`   ✓ Success:`);
      output.split('\n').forEach(line => console.log(`   ${line}`));
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    return false;
  }
}

console.log('Building project...');
try {
  execSync('cargo build', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.error('Build failed!');
  process.exit(1);
}

console.log('\n');

const tests = [
  {
    name: 'Single URL',
    args: ['https://example.com'],
    success: true,
  },
  {
    name: 'Two URLs (race)',
    args: ['https://example.com', 'https://www.rust-lang.org'],
    success: true,
  },
  {
    name: 'No URLs (error case)',
    args: [],
    success: false,
  },
  {
    name: 'Too many URLs (error case)',
    args: ['url1', 'url2', 'url3', 'url4'],
    success: false,
  },
];

let passed = 0;
for (const test of tests) {
  if (runTest(test.name, test.args, test.success)) {
    passed++;
  }
  console.log();
}

console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`);
process.exit(passed === tests.length ? 0 : 1);
