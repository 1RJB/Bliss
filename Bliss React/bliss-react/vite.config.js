import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: {
      pfx: fs.readFileSync(path.resolve(__dirname, 'localhost.pfx')),
      passphrase: 'password'
    }
  }
})