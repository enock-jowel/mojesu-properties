import { AdminLoginForm } from '@/components/admin/login-form'
import { SiteLogo } from '@/components/site-logo'

export const metadata = {
  title: 'Staff login — Mojesu',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex justify-center">
        <SiteLogo
          markClassName="h-11 w-11"
          wordmarkClassName="text-2xl font-extrabold tracking-tight text-ink"
          priority
        />
      </div>
      <div className="w-full max-w-[360px] rounded-2xl border border-neutral-light bg-surface px-5 py-6 shadow-[0_8px_30px_rgba(42,46,50,0.08)]">
        <h1 className="text-center text-[15px] font-extrabold text-ink">
          Staff sign in
        </h1>
        <p className="mt-1.5 text-center text-[12px] leading-snug text-neutral-muted">
          Internal Mojesu listings portal — invite-only access.
        </p>
        <div className="mt-5">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  )
}
