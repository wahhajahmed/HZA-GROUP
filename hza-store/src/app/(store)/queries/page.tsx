'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, Loader2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

type Query = {
  id: string
  subject: string
  message: string
  status: 'open' | 'replied' | 'closed'
  admin_reply: string | null
  created_at: string
  updated_at: string
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  open: 'warning',
  replied: 'success',
  closed: 'secondary',
}

const statusLabels: Record<string, string> = {
  open: 'Awaiting Reply',
  replied: 'Replied',
  closed: 'Closed',
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login?redirect=/queries'
        return
      }
      setUser(user)
      await fetchQueries(supabase, user.id)

      // Realtime - update when admin replies
      const channel = supabase
        .channel('user-queries')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_queries',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setQueries((prev) =>
            prev.map((q) => q.id === payload.new.id ? { ...q, ...payload.new as Query } : q)
          )
          if ((payload.new as Query).status === 'replied') {
            toast.success('Admin has replied to your query!', {
              description: (payload.new as Query).subject,
            })
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [])

  async function fetchQueries(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase
      .from('support_queries')
      .select('id, subject, message, status, admin_reply, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setQueries(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      if (!user) return
      const supabase = createClient()
      const { error } = await supabase.from('support_queries').insert({
        user_id: user.id,
        name: (user.user_metadata?.full_name as string) ?? user.email,
        email: user.email,
        subject: form.subject,
        message: form.message,
        status: 'open',
        is_read: false,
      })
      if (error) throw error
      toast.success('Query submitted! We\'ll reply within 24 hours.')
      setForm({ subject: '', message: '' })
      setShowForm(false)
      const supabase2 = createClient()
      await fetchQueries(supabase2, user.id)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Queries</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your questions and admin replies</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Query'}
        </Button>
      </div>

      {/* New Query Form */}
      {showForm && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Question about my order"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your question or issue in detail..."
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Query
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Queries List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : queries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No queries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click &quot;New Query&quot; to ask us anything</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {queries.map((query) => (
            <Card
              key={query.id}
              className={query.status === 'replied' && !expanded?.startsWith(query.id + '-seen')
                ? 'border-green-300 bg-green-50/30'
                : ''}
            >
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpanded(expanded === query.id ? null : query.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{query.subject}</span>
                        {query.status === 'replied' && (
                          <span className="flex h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        )}
                        <Badge variant={statusColors[query.status] ?? 'secondary'}>
                          {statusLabels[query.status] ?? query.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(query.created_at)}</p>
                    </div>
                    <div className="shrink-0 text-muted-foreground">
                      {expanded === query.id
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {expanded === query.id && (
                  <div className="px-5 pb-5 space-y-3 border-t">
                    <div className="pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your Message</p>
                      <p className="text-sm bg-gray-50 rounded-lg p-3">{query.message}</p>
                    </div>

                    {query.admin_reply ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-1">Admin Reply</p>
                        <p className="text-sm text-green-900">{query.admin_reply}</p>
                        <p className="text-xs text-green-600 mt-2">Replied on {formatDate(query.updated_at)}</p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-700">⏳ Awaiting admin reply — usually within 24 hours</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/account" className="text-sm text-muted-foreground hover:underline">
          ← Back to Account
        </Link>
      </div>
    </div>
  )
}
