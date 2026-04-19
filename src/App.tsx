import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useSessionInit } from '@/hooks/useSession'

export function App() {
  useSessionInit()
  return <RouterProvider router={router} />
}
