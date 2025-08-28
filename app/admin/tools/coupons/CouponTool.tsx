'use client'

import { useMemo, useState } from 'react'

import {
  adminAddOrUpdateCouponEmail,
  adminGetCouponByCode,
  adminListCouponEmails,
  adminRemoveCouponEmail,
  adminUpsertCoupon,
} from './actions'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { DbCoupon, DbCouponEmail } from '@/types/database/dbTypeAliases'

type FormState = {
  couponCode: string
  description: string
  discountAmountDollars: string // store as string for input control
  enabled: boolean
  emailFor: boolean
  maxUses: string // blank -> null
}

const initialForm: FormState = {
  couponCode: '',
  description: '',
  discountAmountDollars: '',
  enabled: true,
  emailFor: false,
  maxUses: '',
}

export default function CouponTool({}: {
  searchParams?: Promise<Record<string, string | undefined>>
} = {}) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<DbCoupon | null>(null)
  const [emails, setEmails] = useState<DbCouponEmail[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newEmailMaxUses, setNewEmailMaxUses] = useState<string>('1')
  const [emailOpLoading, setEmailOpLoading] = useState(false)

  const discountAmountCents = useMemo(() => {
    const n = parseFloat(form.discountAmountDollars)
    if (Number.isNaN(n)) return 0
    return Math.round(n * 100)
  }, [form.discountAmountDollars])

  const maxUsesParsed = useMemo(() => {
    const n = parseInt(form.maxUses, 10)
    if (!form.maxUses.trim()) return null
    return Number.isNaN(n) ? null : n
  }, [form.maxUses])

  const canSave = useMemo(() => {
    return (
      form.couponCode.trim().length > 0 &&
      discountAmountCents >= 0 &&
      !Number.isNaN(discountAmountCents)
    )
  }, [form.couponCode, discountAmountCents])

  const loadCoupon = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const found = await adminGetCouponByCode({
        couponCode: form.couponCode.trim(),
      })
      if (!found) {
        setCoupon(null)
        setEmails([])
        setSuccess('No existing coupon found. Fill details and Save to create.')
        return
      }
      setCoupon(found)
      setForm((prev) => ({
        ...prev,
        couponCode: found.coupon_code,
        description: found.description ?? '',
        discountAmountDollars: (found.discount_amount_cents / 100).toFixed(2),
        enabled: found.enabled,
        emailFor: found.email_for,
        maxUses: found.max_uses == null ? '' : String(found.max_uses),
      }))
      const list = await adminListCouponEmails({ couponId: found.id })
      setEmails(list)
      setSuccess('Loaded coupon')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load coupon')
    } finally {
      setLoading(false)
    }
  }

  const saveCoupon = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const saved = await adminUpsertCoupon({
        couponCode: form.couponCode.trim(),
        description: form.description.trim() || null,
        discountAmountCents,
        emailFor: form.emailFor,
        enabled: form.enabled,
        maxUses: maxUsesParsed,
      })
      setCoupon(saved)
      // Reload emails if this was a new coupon
      const list = await adminListCouponEmails({ couponId: saved.id })
      setEmails(list)
      setSuccess('Coupon saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  const addOrUpdateEmail = async () => {
    if (!coupon) return
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    const max = parseInt(newEmailMaxUses, 10)
    if (Number.isNaN(max) || max <= 0) return
    setEmailOpLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await adminAddOrUpdateCouponEmail({
        couponId: coupon.id,
        email,
        maxUses: max,
      })
      // Update emails list in-place
      setEmails((prev) => {
        const idx = prev.findIndex((e) => e.email.toLowerCase() === email)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = updated
          return copy
        }
        return [...prev, updated]
      })
      setNewEmail('')
      setNewEmailMaxUses('1')
      setSuccess('Email authorization saved')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to save email authorization',
      )
    } finally {
      setEmailOpLoading(false)
    }
  }

  const removeEmail = async (email: string) => {
    if (!coupon) return
    setEmailOpLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await adminRemoveCouponEmail({ couponId: coupon.id, email })
      setEmails((prev) => prev.filter((e) => e.email.toLowerCase() !== email))
      setSuccess('Email authorization removed')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to remove email authorization',
      )
    } finally {
      setEmailOpLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="couponCode">Coupon Code *</Label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              value={form.couponCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, couponCode: e.target.value }))
              }
              placeholder="e.g. EARLYBIRD25"
            />
            <Button
              variant="secondary"
              onClick={loadCoupon}
              disabled={loading || !form.couponCode.trim()}
            >
              Load
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Discount (USD)</Label>
          <Input
            id="discount"
            inputMode="decimal"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.discountAmountDollars}
            onChange={(e) =>
              setForm((f) => ({ ...f, discountAmountDollars: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Optional description shown to admins and in tooling"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="enabled"
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="emailFor"
            checked={form.emailFor}
            onCheckedChange={(v) => setForm((f) => ({ ...f, emailFor: !!v }))}
          />
          <Label htmlFor="emailFor">Limit to specific emails</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxUses">Max Uses (overall)</Label>
          <Input
            id="maxUses"
            type="number"
            min="0"
            placeholder="Leave blank for unlimited"
            value={form.maxUses}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxUses: e.target.value }))
            }
          />
        </div>

        {coupon && (
          <div className="space-y-1">
            <Label>Usage</Label>
            <div className="text-sm text-muted-foreground">
              Used {coupon.used_count} times
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={saveCoupon}
          disabled={loading || !canSave}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving…' : 'Save Coupon'}
        </Button>
      </div>

      {form.emailFor && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Approved Emails</h3>
          {!coupon && (
            <div className="text-sm text-muted-foreground">
              Save the coupon first to add emails.
            </div>
          )}

          {coupon && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  placeholder="email@example.com"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="md:w-1/2"
                />
                <Input
                  placeholder="Max uses"
                  type="number"
                  min="1"
                  value={newEmailMaxUses}
                  onChange={(e) => setNewEmailMaxUses(e.target.value)}
                  className="md:w-40"
                />
                <Button
                  onClick={addOrUpdateEmail}
                  disabled={emailOpLoading || !newEmail.trim()}
                >
                  {emailOpLoading ? 'Saving…' : 'Add / Update Email'}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Max Uses</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((e) => (
                    <TableRow key={`${e.coupon_id}-${e.email}`}>
                      <TableCell className="font-mono text-xs">
                        {e.email}
                      </TableCell>
                      <TableCell>{e.uses}</TableCell>
                      <TableCell>{e.max_uses}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEmail(e.email.toLowerCase())}
                          disabled={emailOpLoading}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {emails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        No approved emails yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption>
                  Manage which emails can use this coupon.
                </TableCaption>
              </Table>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 p-3 text-green-400">
          {success}
        </div>
      )}
    </div>
  )
}
