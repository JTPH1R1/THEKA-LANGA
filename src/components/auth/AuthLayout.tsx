import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2D6A] via-[#1e3480] to-[#0f4d6e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-teal-300 tracking-tight">THEKA LANGA</div>
          <div className="text-xs text-blue-200/60 mt-1 tracking-widest uppercase">My Portion</div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mb-6">{description}</p>
          )}
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-200/40 mt-6">
          &copy; {new Date().getFullYear()} Theka Langa. Cooperative financial management.
        </p>
      </div>
    </div>
  )
}
