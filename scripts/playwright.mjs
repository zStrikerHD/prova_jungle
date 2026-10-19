import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'

const suite = process.argv[2]
const projects = suite === 'e2e'
  ? ['e2e-desktop', 'e2e-mobile']
  : suite === 'visual'
    ? ['visual-desktop', 'visual-mobile']
    : null

if (!projects) throw new Error('Suíte deve ser e2e ou visual.')

const root = new URL('..', import.meta.url)
const origin = 'http://127.0.0.1:5199'
const server = spawn(process.execPath, [
  './node_modules/vite/bin/vite.js',
  '--host', '127.0.0.1',
  '--port', '5199',
  '--strictPort',
], { cwd: root, stdio: 'ignore' })

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`O Vite terminou com código ${server.exitCode}.`)
    try { if ((await fetch(origin)).ok) return } catch { /* servidor ainda iniciando */ }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('O Vite não iniciou na porta 5199.')
}

function stopServer() {
  if (server.exitCode !== null) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' })
  } else {
    server.kill('SIGTERM')
  }
}

function runPlaywright() {
  const args = ['./node_modules/@playwright/test/cli.js', 'test', ...projects.flatMap((project) => ['--project', project])]
  return new Promise((resolve, reject) => {
    const test = spawn(process.execPath, args, {
      cwd: root,
      env: { ...process.env, PW_SKIP_SERVER: '1' },
      stdio: 'inherit',
    })
    test.on('error', reject)
    test.on('exit', (code) => resolve(code ?? 1))
  })
}

try {
  await waitForServer()
  process.exitCode = await runPlaywright()
} finally {
  stopServer()
}
