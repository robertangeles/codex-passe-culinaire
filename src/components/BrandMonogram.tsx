// Keep the approved geometry in a cacheable asset, outside the inline RSC payload.
export function BrandMonogram({ className, display = false }: { className?: string; display?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 480 512" aria-hidden="true" focusable="false">
      <use href={`/brand/monogram.svg#${display ? 'display' : 'small'}`} />
    </svg>
  )
}
