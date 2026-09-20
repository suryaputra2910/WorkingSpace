import { useEffect, useState } from 'react'
import { getImageUrl } from '../../utils/image.js'

// Space photo shared by every admin/member/public screen.
export default function SpaceImage({ space, foto, foto_url, alt, className = 'w-full h-full object-cover', fallback = null }) {
  // Use explicit props if provided, otherwise fall back to space object properties
  const actualFotoUrl = foto_url !== undefined ? foto_url : space?.foto_url
  const actualFoto = foto !== undefined ? foto : space?.foto

  // Build the list of potential URLs. 
  const urls = [
    getImageUrl(actualFotoUrl, 'spaces'),
    getImageUrl(actualFoto, 'spaces')
  ].filter(Boolean)
  
  const sources = [...new Set(urls)]
  const signature = sources.join('|')
  const [index, setIndex] = useState(0)

  useEffect(() => { setIndex(0) }, [signature])

  const src = sources[index]
  
  if (!src) return fallback

  return (
    <img
      src={src}
      alt={alt ?? space?.nama_space ?? 'Foto space'}
      className={className}
      onError={() => setIndex((i) => i + 1)}
    />
  )
}
