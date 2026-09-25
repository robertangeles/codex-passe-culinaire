# Prepare and publish content

Sign in at `/admin` with your own account. Pages are assembled from blocks; Journal entries use the rich-text editor. Training and Services have their own collections. New records remain drafts until you publish them.

## Drafts and preview

Give the record a title and a unique lowercase address. Add the content, then open the SEO tab. Its search preview uses the same title and description fallback order as publication validation. A search title must fit within 60 characters and a description within 160. Journal entries also require an excerpt. Media uploads need alt text.

Use Save Draft while working. Autosave also saves drafts. On a saved Page or Journal entry, choose Live Preview for the side-by-side view. After a successful save, the preview refreshes from the server. It requires your current staff session; an expired session cannot reveal a private draft. Exit preview before checking the public version in the same browser, or use a separate signed-out window.

Publish changes makes the latest content public. The worker must be running for page caches and dependent outputs to refresh within 60 seconds. The public text is rendered on the server. Preview responses are private and must never be cached by a proxy or CDN.

## Duplicate a page

Use Duplicate in the document menu. The copy receives a new address ending in a unique copy identifier. It starts as a draft, keeps its blocks and media references, and clears the original publication date and canonical override. Review its title, address, content and SEO before publishing. Editing a copy does not change the source page.

## Schedule a publication

An administrator can schedule publication. Editors can save drafts and publish immediately, but cannot schedule or cancel jobs. Open the Publish tab. Choose Publish or Unpublish, a local date and time, and either `Australia/Melbourne` or `UTC`. Melbourne is the default. The Schedule action saves the current draft first and queues the job only after that save succeeds. A queued publication uses the latest saved draft when it runs; later draft edits are therefore included.

The scheduler converts your selection to one UTC instant. It rejects a Melbourne time that falls in the missing spring hour or occurs twice during the autumn change. It never silently moves a time or chooses one of two offsets. For a repeated hour, select UTC and enter the exact intended instant. For example, Melbourne 02:30 on 5 April 2026 corresponded to either 15:30 or 16:30 UTC on 4 April; Melbourne 02:30 on 4 October 2026 does not exist.

The Publish tab lists pending and failed jobs. Cancel a pending job there before replacing it. A job already being processed cannot be cancelled from the panel. Closing the browser does not cancel a job. Execution rechecks that the account which scheduled it still exists and has administrator access. Publication validation still applies when the job executes.

## Worker and failures

Use one continuous worker arrangement:

- The deployment systemd timer runs `pnpm jobs:run` every ten seconds, using `CRON_SECRET` to call the private POST `/api/jobs/run` endpoint.
- Alternatively, `RUN_JOBS=true` enables Payload's ten-second production-process polling. Leave the timer disabled in this mode.

The HTTP worker takes two bounded batches of 20 due jobs, allowing a publication and its newly queued cache invalidation to run in the same tick. A later tick picks up remaining work. Database and notification failures leave saved content intact. Failed tasks retry up to five times at ten-second intervals, then remain visible for investigation. An administrator can inspect Publication jobs under System for wait time, completion, attempts and error details. Editors cannot read that system collection or change scheduled jobs.

If a job fails, correct the content or account problem, cancel the failed schedule in the Publish tab and schedule it again. A worker HTTP 503 means a batch had an error or the worker was unavailable. Do not treat it as a successful run. Operators should check process logs and failed/late jobs, and restore continuous execution before claiming the 60-second freshness target.

The installed Payload 3.90.2 schedule drawer does not propagate its returned server errors to its success toast and normalises local DST inputs. This project therefore uses a small validated scheduling panel and the supported Payload task queue. The built-in immediate Publish, drafts, versions, duplication and preview controls remain in use.
