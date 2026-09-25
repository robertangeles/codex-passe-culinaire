import type { Testimonial, Testimonial1 } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import styles from './TestimonialBlock.module.css'

type TestimonialBlockProps = {
  block: Testimonial
}

function isPublishedTestimonial(value: Testimonial['testimonial']): value is Testimonial1 {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.published === true &&
    typeof value.quote === 'string' &&
    value.quote.trim().length > 0 &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  )
}

export function TestimonialBlock({ block }: TestimonialBlockProps) {
  const testimonial = block.testimonial
  if (!isPublishedTestimonial(testimonial)) return null

  const details = [testimonial.role, testimonial.venue]
    .filter((detail): detail is string => typeof detail === 'string' && detail.trim().length > 0)
    .join(' · ')

  return (
    <EditorialSection>
      <figure className={styles.figure}>
        <blockquote className={styles.quote}>
          <p className={styles.text}>{testimonial.quote}</p>
        </blockquote>
        <figcaption className={styles.attribution}>
          <span className={styles.name}>{testimonial.name}</span>
          {details && <span className={styles.details}>{details}</span>}
        </figcaption>
      </figure>
    </EditorialSection>
  )
}
