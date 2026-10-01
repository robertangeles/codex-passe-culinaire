'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './JournalEditorial.module.css'

type JournalMasonryProps = {
  children: ReactNode
  label: string
}

const ROW_HEIGHT = 8

export function JournalMasonry({ children, label }: JournalMasonryProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || !('ResizeObserver' in window)) return

    const cards = Array.from(list.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
    const layout = () => {
      if (window.matchMedia('(max-width: 740px)').matches) {
        list.removeAttribute('data-enhanced')
        cards.forEach((card) => { card.style.gridRowEnd = '' })
        return
      }

      // Include the enhanced card padding before calculating each occupied span.
      list.setAttribute('data-enhanced', 'true')
      const heights = cards.map((card) => card.scrollHeight)
      cards.forEach((card, index) => {
        const rows = Math.ceil(heights[index] / ROW_HEIGHT)
        card.style.gridRowEnd = `span ${Math.max(1, rows)}`
      })
    }

    const observer = new ResizeObserver(layout)
    cards.forEach((card) => observer.observe(card))
    window.addEventListener('resize', layout)
    layout()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', layout)
      list.removeAttribute('data-enhanced')
      cards.forEach((card) => { card.style.gridRowEnd = '' })
    }
  }, [])

  return (
    <ul ref={listRef} className={styles.followers} data-journal-masonry="true" aria-label={label}>
      {children}
    </ul>
  )
}
