import { useEffect, useState } from 'react'
import { getImageUrl } from '../../utils/image.js'
import { initialOf } from '../../utils/profile.js'

// Round avatar: shows the uploaded photo when there is one and it loads,
// otherwise falls back to the first letter of the name.
// `type` selects the upload folder ('members' | 'spaces' | 'general').
export default function Avatar({ foto, name, type = 'members', shape = 'round', className = 'w-8 h-8 text-xs', textClassName = '' }) {
  const src = getImageUrl(foto, type)
  const [failed, setFailed] = useState(false)

  // A new photo (e.g. after re-upload) gets a fresh chance to load.
  useEffect(() => { setFailed(false) }, [src])

  return (
    <div className={`${shape === 'square' ? 'rounded-md' : 'rounded-full'} overflow-hidden bg-sand flex items-center justify-center shrink-0 ${className}`}>
      {src && !failed ? (
        <img src={src} alt={name || 'Foto'} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className={`font-medium text-stone ${textClassName}`}>{initialOf(name)}</span>
      )}
    </div>
  )
}
