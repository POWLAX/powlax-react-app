'use client'

import React, { useEffect, useState } from 'react'
// Fetch via server API to avoid client-side RLS recursion issues

type Org = { id: string; name: string }
type Team = { id: string; name: string; club_id?: string | null }
type MemberRow = { team_id: string; user_id: string; role: string; user?: { email?: string; full_name?: string; username?: string } }

export default function WPImportCheckPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/wp-import-check', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load')

        const { orgs, teams, members, usersById } = json
        const membersWithUser = (members as any[]).map(m => ({
          ...m,
          user: usersById?.[m.user_id] || null
        }))

        setOrgs(orgs || [])
        setTeams(teams || [])
        setMembers(membersWithUser as any)
      } catch (e: any) {
        setError(e?.message || 'Load error')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const teamMembersByTeam: Record<string, MemberRow[]> = members.reduce((acc, m) => {
    acc[m.team_id] = acc[m.team_id] || []
    acc[m.team_id].push(m)
    return acc
  }, {} as Record<string, MemberRow[]>)

  // Group teams by club_id when available
  const teamsByOrg: Record<string, Team[]> = teams.reduce((acc, t) => {
    const key = t.club_id || 'all'
    acc[key] = acc[key] || []
    acc[key].push(t)
    return acc
  }, {} as Record<string, Team[]>)

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">WordPress Import Check</h1>

      {/* Dashboard summary */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Organizations" value={orgs.length} />
          <Stat label="Teams" value={teams.length} />
          <Stat label="Members" value={members.length} />
        </div>
      </section>

      {/* Club OS */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Club OS</h2>
        {orgs.length === 0 && <div className="text-sm text-muted-foreground">No organizations found.</div>}
        <div className="space-y-6">
          {orgs.map(org => (
            <div key={org.id} className="border rounded p-4">
              <div className="font-medium">{org.name}</div>
              <div className="text-xs text-muted-foreground">organization id: {org.id}</div>
              <div className="mt-3 space-y-2">
                {(teamsByOrg[org.id] || teamsByOrg['all'] || []).map(team => (
                  <div key={team.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{team.name}</div>
                      <div className="text-xs text-muted-foreground">team id: {team.id}</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Members</div>
                      <ul className="text-sm list-disc pl-5">
                        {(teamMembersByTeam[team.id] || []).map((m, idx) => (
                          <li key={team.id + idx}>
                            <span className="font-mono text-xs">{m.role}</span>{' '}•{' '}
                            {m.user?.full_name || m.user?.username || m.user?.email || m.user_id}
                          </li>
                        ))}
                        {(teamMembersByTeam[team.id] || []).length === 0 && (
                          <li className="text-muted-foreground">No members</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
                {(!(teamsByOrg[org.id] || []).length && !(teamsByOrg['all'] || []).length) && (
                  <div className="text-sm text-muted-foreground">No teams linked yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team HQ (teams without org or for quick glance) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Teams (All)</h2>
        <div className="grid gap-3">
          {(teamsByOrg['all'] || []).map(team => (
            <div key={team.id} className="border rounded p-3">
              <div className="font-medium">{team.name}</div>
              <div className="text-xs text-muted-foreground">team id: {team.id}</div>
              <div className="mt-2">
                <div className="text-sm font-medium">Members</div>
                <ul className="text-sm list-disc pl-5">
                  {(teamMembersByTeam[team.id] || []).map((m, idx) => (
                    <li key={team.id + ':' + idx}>
                      <span className="font-mono text-xs">{m.role}</span>{' '}•{' '}
                      {m.user?.full_name || m.user?.username || m.user?.email || m.user_id}
                    </li>
                  ))}
                  {(teamMembersByTeam[team.id] || []).length === 0 && (
                    <li className="text-muted-foreground">No members</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}


