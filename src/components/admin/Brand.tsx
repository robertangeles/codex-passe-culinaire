import type { FC } from 'react'

/** Payload admin navigation and login wordmark. */
export const Logo: FC = () => (
  <span className="pc-admin-logo" aria-label="Passe Culinaire">
    <span className="pc-admin-logo__word">passe culinaire</span>
  </span>
)

/** Compact navigation mark for Payload's sidebar. */
export const Icon: FC = () => (
  <span className="pc-admin-icon" role="img" aria-label="Passe Culinaire">
    pc
  </span>
)

/** Dashboard introduction for editors preparing public content. */
export const Welcome: FC = () => (
  <section className="pc-admin-welcome" aria-labelledby="pc-admin-welcome-title">
    <h2 id="pc-admin-welcome-title">Prepare, review, publish</h2>
    <p>
      Keep pages, Journal stories and Training details in draft while you work. Publish them when
      they are ready, or schedule a release for a chosen time.
    </p>
  </section>
)
