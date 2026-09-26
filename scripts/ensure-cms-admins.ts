/**
 * Ensure production CMS owner + Zoho admin accounts exist with correct roles.
 *
 * Usage:
 *   node --env-file=.env.mdbx.local --env-file=.env.admin.local --env-file=.env.zoho-cms.local \
 *     scripts/ensure-cms-admins.ts
 *
 * Requires migration 010_superadmin_role.sql applied for role=superadmin.
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

type Role = 'superadmin' | 'admin' | 'staff'

type Account = {
  email: string
  role: Role
  fullName: string
  password?: string
}

const accounts: Account[] = [
  {
    email: process.env.ADMIN_EMAIL || 'enockjowel1231@gmail.com',
    role: 'superadmin',
    fullName: 'Enock Jowel',
    password: process.env.ADMIN_PASSWORD,
  },
  {
    email: process.env.CMS_ADMIN_EMAIL || 'jowelnionzima@gmail.com',
    role: 'admin',
    fullName: 'Jowel Nionzima',
    password: process.env.CMS_ADMIN_PASSWORD,
  },
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const listed = await sb.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listed.error) throw listed.error

  for (const acct of accounts) {
    const email = acct.email.trim().toLowerCase()
    let user = listed.data.users.find(
      (u) => (u.email || '').toLowerCase() === email,
    )
    const password = acct.password || randomBytes(18).toString('base64url')

    if (!user) {
      const created = await sb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: acct.fullName, role: acct.role },
      })
      if (created.error || !created.data.user) {
        throw created.error || new Error(`createUser failed for ${email}`)
      }
      user = created.data.user
      console.log(
        'created',
        email,
        acct.password ? '(password from env)' : `(generated: ${password})`,
      )
    } else if (acct.password) {
      const upd = await sb.auth.admin.updateUserById(user.id, {
        password: acct.password,
        email_confirm: true,
      })
      if (upd.error) throw upd.error
      console.log('password synced', email)
    } else {
      console.log('exists', email)
    }

    const { error } = await sb.from('profiles').upsert({
      id: user.id,
      role: acct.role,
      full_name: acct.fullName,
    })
    if (error) {
      throw new Error(
        `profile upsert failed for ${email}: ${error.message}. Apply supabase/migrations/010_superadmin_role.sql if role=superadmin is rejected.`,
      )
    }
    console.log('role', email, '→', acct.role)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
