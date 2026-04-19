import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-teal-400 tracking-tight">THEKA LANGA</div>
          <div className="text-xs text-slate-500 mt-1 tracking-widest uppercase">My Portion</div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h1 className="text-xl font-semibold text-slate-100 mb-1">{title}</h1>
          {description && (
            <p className="text-sm text-slate-400 mb-6">{description}</p>
          )}
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} Theka Langa. Cooperative financial management.
        </p>
      </div>
    </div>
  )
}
