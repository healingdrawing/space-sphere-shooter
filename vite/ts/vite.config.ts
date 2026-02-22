import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env_folder = '../../bun/'
  // Load env vars from .env.[mode] in the specified envDir
  const env = loadEnv("development", path.resolve(__dirname, env_folder), '')

  return {
    envDir: path.resolve(__dirname, env_folder),
    server: {
      host: env.VITE_CLIENT_HOST || 'localhost', // fallback to 'localhost'
      port: parseInt(env.VITE_CLIENT_PORT) || 5173, // fallback to 5173
    },
  }
})
