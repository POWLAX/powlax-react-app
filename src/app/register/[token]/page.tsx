'use client'

import React, { useEffect, useState } from 'react'

export default function RegisterWithTokenPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [state, setState] = useState<'loading'|'ready'|'done'|'error'>('loading')
  const [error, setError] = useState<string>('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setState('ready')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/register/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, fullName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Registration failed')
      setState('done')
    } catch (err: any) {
      setError(err?.message || 'Error')
      setState('error')
    }
  }

  if (state === 'loading') return <div className="p-6">Loading…</div>
  if (state === 'done') return <div className="p-6">Registration complete. You can close this page.</div>

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Join your team</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="border rounded px-3 py-2 w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input className="border rounded px-3 py-2 w-full" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <button className="bg-black text-white rounded px-4 py-2" type="submit">Register</button>
      </form>
    </div>
  )
}


