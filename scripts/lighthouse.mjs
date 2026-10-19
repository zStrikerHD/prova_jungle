import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const requested = process.argv[2]
const profiles = requested ? [requested] : ['mobile', 'desktop']
if (profiles.some((profile) => !['mobile', 'desktop'].includes(profile))) throw new Error('Perfil deve ser mobile ou desktop.')

const origin = 'http://127.0.0.1:4173'
const pages = [{ name: 'home', path: '/' }, { name: 'detail', path: '/mercado/nft/1' }]
const reportDirectory = new URL('../reports/lighthouse/', import.meta.url)
await mkdir(reportDirectory, { recursive: true })

const preview = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, VITE_ENABLE_MOCKS: 'true' },
  stdio: 'ignore',
})

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) return } catch { /* server ainda iniciando */ }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('O preview não iniciou na porta 4173.')
}

function runLighthouse(url, outputPath, profile) {
  const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const args = ['lighthouse', url, '--output=json', '--output=html', `--output-path=${outputPath}`, '--quiet', '--chrome-flags=--headless=new']
  if (profile === 'desktop') args.push('--preset=desktop')
  return new Promise((resolve, reject) => {
    const audit = spawn(executable, args, { cwd: new URL('..', import.meta.url), stdio: 'inherit', shell: process.platform === 'win32' })
    audit.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Lighthouse terminou com código ${code}.`)))
  })
}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

try {
  await waitForServer()
  for (const profile of profiles) {
    for (const page of pages) {
      const runs = []
      for (let run = 1; run <= 3; run += 1) {
        const base = new URL(`${profile}-${page.name}-run-${run}`, reportDirectory).pathname.replace(/^\/(.:\/)/, '$1')
        await runLighthouse(`${origin}${page.path}`, base, profile)
        const report = JSON.parse(await readFile(`${base}.report.json`, 'utf8'))
        runs.push({
          performance: report.categories.performance.score * 100,
          accessibility: report.categories.accessibility.score * 100,
          bestPractices: report.categories['best-practices'].score * 100,
          seo: report.categories.seo.score * 100,
          lcpMs: report.audits['largest-contentful-paint'].numericValue,
          cls: report.audits['cumulative-layout-shift'].numericValue,
          tbtMs: report.audits['total-blocking-time'].numericValue,
        })
      }
      const keys = Object.keys(runs[0])
      const summary = Object.fromEntries(keys.map((key) => [key, median(runs.map((run) => run[key]))]))
      await writeFile(new URL(`${profile}-${page.name}-median.json`, reportDirectory), JSON.stringify({ page: page.path, profile, runs, median: summary, lighthouse: '13.5.0', node: process.version, generatedAt: new Date().toISOString() }, null, 2))
    }
  }
} finally {
  preview.kill()
}
