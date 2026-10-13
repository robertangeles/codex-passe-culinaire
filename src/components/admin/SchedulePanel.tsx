'use client'

import { useAuth, useDocumentInfo, useForm } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import styles from './SchedulePanel.module.css'

type ScheduleAction = 'publish' | 'unpublish'
type ScheduleTimezone = 'Australia/Melbourne' | 'UTC'
type ScheduledJob = {
  id: number | string
  type: ScheduleAction
  waitUntil?: string
  timezone?: ScheduleTimezone
  localTime?: string
  hasError: boolean
  totalTried: number
}

const endpoint = '/api/editorial/schedule'

function jobList(value: unknown): ScheduledJob[] | undefined {
  if (!value || typeof value !== 'object' || !('jobs' in value) || !Array.isArray(value.jobs)) return undefined

  const jobs: ScheduledJob[] = []
  for (const item of value.jobs) {
    if (!item || typeof item !== 'object' || !('id' in item) || !('type' in item)
      || (typeof item.id !== 'string' && typeof item.id !== 'number')) continue
    const type = item.type === 'publish' || item.type === 'unpublish' ? item.type : undefined
    if (!type) continue
    jobs.push({
      id: item.id,
      type,
      ...(typeof item.waitUntil === 'string' ? { waitUntil: item.waitUntil } : {}),
      ...(item.timezone === 'Australia/Melbourne' || item.timezone === 'UTC' ? { timezone: item.timezone } : {}),
      ...(typeof item.localTime === 'string' ? { localTime: item.localTime } : {}),
      hasError: 'hasError' in item && item.hasError === true,
      totalTried: 'totalTried' in item && typeof item.totalTried === 'number' ? item.totalTried : 0,
    })
  }
  return jobs
}

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const result: unknown = await response.json()
    if (result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' && result.error.trim()) return result.error
  } catch {
    return fallback
  }
  return fallback
}

export default function SchedulePanel() {
  const { user } = useAuth()
  const { id, collectionSlug } = useDocumentInfo()
  const { submit } = useForm()
  const [localTime, setLocalTime] = useState('')
  const [timezone, setTimezone] = useState<ScheduleTimezone>('Australia/Melbourne')
  const [action, setAction] = useState<ScheduleAction>('publish')
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isReady = Boolean(id && collectionSlug)
  const query = isReady
    ? `?collection=${encodeURIComponent(collectionSlug!)}&documentId=${encodeURIComponent(String(id))}`
    : ''

  const refreshJobs = useCallback(async () => {
    if (!isReady) {
      setJobs([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${endpoint}${query}`, { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        setError(await responseError(response, 'Could not load scheduled changes. Try again.'))
        return
      }
      const parsed: unknown = await response.json()
      const nextJobs = jobList(parsed)
      if (!nextJobs) {
        setError('Could not load scheduled changes. Try again.')
        return
      }
      setJobs(nextJobs)
    } catch {
      setError('Could not load scheduled changes. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isReady, query])

  useEffect(() => {
    const refresh = window.setTimeout(() => { void refreshJobs() }, 0)
    return () => window.clearTimeout(refresh)
  }, [refreshJobs])

  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!id || !collectionSlug) {
      setError('Save this document before scheduling.')
      return false
    }
    try {
      const result = await submit({
        action: `/api/${encodeURIComponent(collectionSlug)}/${encodeURIComponent(String(id))}?draft=true`,
        method: 'PATCH',
        overrides: { _status: 'draft' },
        skipValidation: true,
      })
      if (!result?.res.ok) {
        setError('Could not save the draft. Review the document and try again.')
        return false
      }
      return true
    } catch {
      setError('Could not save the draft. Check your connection and try again.')
      return false
    }
  }, [collectionSlug, id, submit])

  const saveDraftClick = async () => {
    setIsBusy(true)
    setError('')
    setNotice('')
    try {
      if (await saveDraft()) setNotice('Draft saved.')
    } finally {
      setIsBusy(false)
    }
  }

  const scheduleClick = async () => {
    if (!localTime) {
      setError('Choose a date and time before scheduling.')
      return
    }
    if (!id || !collectionSlug) {
      setError('Save this document before scheduling.')
      return
    }
    setIsBusy(true)
    setError('')
    setNotice('')
    try {
      if (!(await saveDraft())) return
      let response: Response
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ collection: collectionSlug, documentId: id, action: 'schedule', type: action, localTime, timezone }),
        })
      } catch {
        setError('Could not reach the scheduler. Check your connection and try again.')
        return
      }
      if (!response.ok) {
        setError(await responseError(response, 'Could not schedule this change. Try again.'))
        return
      }
      let result: unknown
      try {
        result = await response.json()
      } catch {
        setError('Could not confirm the scheduled change. Refresh the page and check scheduled changes.')
        return
      }
      if (!result || typeof result !== 'object' || !('scheduled' in result) || result.scheduled !== true) {
        setError('Could not confirm the scheduled change. Refresh the page and check scheduled changes.')
        return
      }
      setNotice('Change scheduled.')
      setLocalTime('')
      await refreshJobs()
    } finally {
      setIsBusy(false)
    }
  }

  const cancelClick = async (jobId: number | string) => {
    if (!id || !collectionSlug) return
    setIsBusy(true)
    setError('')
    setNotice('')
    try {
      let response: Response
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ collection: collectionSlug, documentId: id, action: 'cancel', jobId }),
        })
      } catch {
        setError('Could not reach the scheduler. Check your connection and try again.')
        return
      }
      if (!response.ok) {
        setError(await responseError(response, 'Could not cancel this scheduled change. Try again.'))
        return
      }
      const result: unknown = await response.json().catch(() => null)
      if (!result || typeof result !== 'object' || !('cancelled' in result) || result.cancelled !== true) {
        setError('Could not confirm cancellation. Refresh the page and check scheduled changes.')
        return
      }
      setNotice('Scheduled change cancelled.')
      await refreshJobs()
    } finally {
      setIsBusy(false)
    }
  }

  if (user?.role !== 'admin') return <p>An administrator must schedule or cancel publication.</p>

  return (
    <section className={styles.panel} aria-labelledby="schedule-panel-heading">
      <h3 className={styles.heading} id="schedule-panel-heading">Scheduled changes</h3>
      <p className={styles.help}>Save your draft before scheduling. Times are shown in the selected timezone.</p>

      {!isReady && <p className={styles.help}>Save this document before scheduling.</p>}

      <div className={styles.controls}>
        <label className={styles.control} htmlFor="schedule-local-time">
          <span>Date and time</span>
          <input id="schedule-local-time" type="datetime-local" value={localTime} onChange={(event) => setLocalTime(event.target.value)} disabled={isBusy || !isReady} />
        </label>
        <label className={styles.control} htmlFor="schedule-timezone">
          <span>Timezone</span>
          <select id="schedule-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value as ScheduleTimezone)} disabled={isBusy || !isReady}>
            <option value="Australia/Melbourne">Australia/Melbourne</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label className={styles.control} htmlFor="schedule-action">
          <span>Change</span>
          <select id="schedule-action" value={action} onChange={(event) => setAction(event.target.value as ScheduleAction)} disabled={isBusy || !isReady}>
            <option value="publish">Publish</option>
            <option value="unpublish">Unpublish</option>
          </select>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" onClick={saveDraftClick} disabled={isBusy || !isReady}>
          {isBusy ? 'Please wait…' : 'Save draft'}
        </button>
        <button className={styles.primaryButton} type="button" onClick={scheduleClick} disabled={isBusy || !isReady}>
          {isBusy ? 'Please wait…' : 'Schedule change'}
        </button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <div className={styles.jobs}>
        <h4 className={styles.subheading}>Pending or failed changes</h4>
        {isLoading ? <p className={styles.help} role="status">Loading scheduled changes…</p>
          : jobs.length === 0 ? <p className={styles.help}>No scheduled changes.</p>
            : <ul className={styles.jobList}>
              {jobs.map((job) => (
                <li className={styles.job} key={job.id}>
                  <div>
                    <p className={styles.jobTitle}>{job.type === 'publish' ? 'Publish' : 'Unpublish'}</p>
                    <p className={styles.jobTime}>
                      {job.localTime && job.timezone ? `${job.localTime} (${job.timezone})` : job.waitUntil || 'Time not available'}
                    </p>
                    <p className={job.hasError ? styles.jobFailed : styles.jobPending}>
                      {job.hasError ? `Needs attention${job.totalTried > 0 ? ` after ${job.totalTried} attempts` : ''}` : 'Pending'}
                    </p>
                  </div>
                  <button type="button" className={styles.cancelButton} onClick={() => void cancelClick(job.id)} disabled={isBusy}>
                    Cancel
                  </button>
                </li>
              ))}
            </ul>}
      </div>
    </section>
  )
}
