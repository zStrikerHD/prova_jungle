import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    {
      name: 'demo-entrypoint',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return mode === 'demo' ? html.replace('/src/main.tsx', '/src/main.demo.tsx') : html
        },
      },
    },
    {
      name: 'demo-critical-routes',
      transformIndexHtml: {
        order: 'post',
        handler(html, context) {
          if (mode !== 'demo') return html
          const criticalRoutes = ['/src/routes/index.tsx', '/src/routes/mercado/nft/$id.tsx']
          const tags = Object.values(context.bundle ?? {})
            .filter((item) => item.type === 'chunk' && criticalRoutes.some((route) => item.facadeModuleId?.replaceAll('\\', '/').endsWith(route)))
            .map((item) => ({
              tag: 'link',
              attrs: { rel: 'modulepreload', crossorigin: '', href: `/${item.fileName}` },
              injectTo: 'head' as const,
            }))
          return { html, tags }
        },
      },
    },
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
