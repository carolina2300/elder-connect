import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Providers } from './app/providers'
import { enableMocksIfNeeded } from './app/msw'

async function bootstrap() {
  await enableMocksIfNeeded()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers />
    </StrictMode>
  )
}

void bootstrap()
