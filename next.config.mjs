// next.config.mjs
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uthbpvnrrtkngmltlszg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  webpack(config) {
    // 1) Keep your Supabase alias so you’ve got the ESM realtime client
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@supabase/realtime-js': path.resolve(
        __dirname,
        'node_modules/@supabase/realtime-js/dist/module/index.js'
      ),
      '@supabase/realtime-js/dist/main/RealtimeClient.js': path.resolve(
        __dirname,
        'node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js'
      ),
    }

    // 2) Switch to in-memory caching to eliminate the “big strings” warning
    //    and speed up serialization/deserialization dramatically.
    config.cache = {
      type: 'memory',
    }

    return config
  },
}

export default nextConfig
