import Image from 'next/image'
import type { ReactNode } from 'react'
import story from '../../docs/designs/kitchen-animation/remotion-film/story.json'
import { KitchenFilmPlayer } from './KitchenFilmPlayer'
import styles from './KitchenFilm.module.css'

const assets = '/films/kitchen-day'

export function KitchenFilm({
  autoStart = true,
  className,
  id = 'kitchen-story',
  playerClassName,
  intro,
  showIntro = true,
}: {
  autoStart?: boolean
  className?: string
  id?: string
  playerClassName?: string
  intro?: ReactNode
  showIntro?: boolean
}) {
  return (
    <section className={className ?? styles.film} id={id} aria-label="A day in the kitchen">
      {intro ?? (showIntro && (
        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>An illustrative kitchen day</p>
            <h2>A day in the kitchen.</h2>
          </div>
          <p className={styles.standfirst}>The ingredients.<br /> The people. The decisions.</p>
        </div>
      ))}
      <KitchenFilmPlayer autoStart={autoStart} className={playerClassName}>
        <div className={styles.cinema} data-film-cinema>
          <div className={styles.stage} data-film-stage>
            <picture data-film-poster>
              <source media="(max-width: 760px)" srcSet={`${assets}/poster-portrait-v1.webp`} />
              <Image src={`${assets}/poster-landscape-v1.webp`} alt="A pear tart on the kitchen bench, with a chef reviewing the day ahead." width={1920} height={1080} unoptimized loading="lazy" />
            </picture>
            <video data-kitchen-video muted playsInline preload="none" width={1920} height={1080}
              data-desktop-src={`${assets}/landscape-v1.mp4`} data-mobile-src={`${assets}/portrait-v1.mp4`}
              data-desktop-poster={`${assets}/poster-landscape-v1.webp`} data-mobile-poster={`${assets}/poster-portrait-v1.webp`}
              aria-label="A day in the kitchen, a silent two minute eight second film." aria-describedby="kitchen-film-transcript" />
            <p className={styles.error} data-film-error role="status" hidden>The film could not be loaded. <a href={`${assets}/landscape-v1.mp4`}>Open the film directly</a>.</p>
          </div>
          <div className={styles.controls} data-film-controls hidden role="group" aria-label="Film controls">
            <button type="button" data-film-play aria-label="Play the kitchen film">Play</button>
            <input data-film-seek type="range" min="0" max={story.duration} step="0.1" defaultValue="0" aria-label="Film position" aria-valuetext="0:00 of 2:08" />
            <span className={styles.time} data-film-time>0:00 / 2:08</span>
            <button type="button" data-film-fullscreen aria-label="View the film full screen">Full screen</button>
          </div>
        </div>
      </KitchenFilmPlayer>
      <div id="kitchen-film-transcript" className={styles.transcript}>
        <ol>{story.chapters.map(chapter => <li key={chapter.id}><strong>{chapter.label}.</strong> {chapter.description}</li>)}</ol>
        <p>Illustrative figures: 80 forecast covers and 74 served; 24 pear tart portions prepared, 21 sold and 3 remaining for review. Pear stock begins at 8 kg. A 10 kg delivery is accepted against 12 kg ordered, bringing stock to 18 kg. Then 3 kg is drawn, with 2.4 kg used in the recipe, 0.3 kg returned and 0.3 kg recorded as waste. At an illustrative $4 per kg, that waste is $1.20. Closing stock is 15.3 kg. The separate savoury recipe example uses a $3.20 portion cost and $16 menu price, or 20% food cost.</p>
        <p>This is an illustrative kitchen story, not a product screen or a claim of automatic product behaviour.</p>
      </div>
      <noscript>
        <p className={styles.noscript}>Open the <a href={`${assets}/landscape-v1.mp4`}>landscape film</a> or <a href={`${assets}/portrait-v1.mp4`}>portrait film</a>.</p>
      </noscript>
    </section>
  )
}
