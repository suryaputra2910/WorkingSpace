import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Button from './Button.jsx'
import Avatar from '../common/Avatar.jsx'
import { getImageUrl } from '../../utils/image.js'
import { validateImageFile } from '../../api/upload.js'

// Photo field that does NOT upload on its own. It only holds the chosen File
// (shown as a local preview); the parent uploads it on submit and saves the
// returned filename. When no new file is chosen the existing photo is shown
// and the parent leaves `foto` out of the payload, so the old photo is kept.
//
// variant: 'wide' (space 16:9 preview) | 'round' (member avatar)
export default function PhotoPicker({ currentFoto, file, onChange, type, name, variant = 'wide', disabled = false }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')

  // Local preview of the newly chosen file; released when replaced/unmounted.
  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handlePick = (e) => {
    const picked = e.target.files?.[0]
    // Allow picking the same file again later.
    e.target.value = ''
    if (!picked) return
    const problem = validateImageFile(picked)
    if (problem) {
      toast.error(problem)
      return
    }
    onChange(picked)
  }

  const shownSrc = previewUrl || getImageUrl(currentFoto, type)

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {variant === 'round' ? (
        <Avatar foto={shownSrc} name={name} type={type} className="w-24 h-24 border-4 border-white shadow-soft" textClassName="text-3xl font-display" />
      ) : (
        <div className="w-full sm:w-64 aspect-video bg-sand rounded-lg overflow-hidden border border-stone/10">
          {shownSrc ? (
            <img src={shownSrc} alt="Preview foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone text-sm">Tidak ada foto</div>
          )}
        </div>
      )}

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled}>
            {currentFoto || file ? 'Ganti Foto' : 'Pilih Foto'} (Maks 2MB)
          </Button>
          {file && (
            <Button type="button" variant="ghost" onClick={() => onChange(null)} disabled={disabled}>
              Batalkan foto baru
            </Button>
          )}
        </div>
        <p className="text-xs text-stone">
          Format: JPG, PNG. {file ? `Foto baru dipilih: ${file.name}. Akan diunggah saat disimpan.` : 'Kosongkan jika tidak ingin mengubah foto.'}
        </p>
        <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
      </div>
    </div>
  )
}
