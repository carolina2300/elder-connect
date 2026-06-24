export async function enableMocksIfNeeded() {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_MSW !== 'on') return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}
