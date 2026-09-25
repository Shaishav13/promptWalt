import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PromptWaltsss',
    short_name: 'PromptWalts',
    description: 'Personal AI Prompt Manager',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
