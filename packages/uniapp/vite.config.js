import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'
// https://vitejs.dev/config/

// export default defineConfig({
//   plugins: [uni()],
//   resolve: {
//     alias: {
//       "@": resolve(__dirname, "src"),
//     },
//   },
//   build: {
//     rollupOptions: {
//       external: ["@dcloudio/uni-ui"],
//     },
//   },
// });

export default defineConfig(async () => {
  const UnoCss = await import('unocss/vite').then((i) => i.default)
  return {
    plugins: [uni(), UnoCss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})
