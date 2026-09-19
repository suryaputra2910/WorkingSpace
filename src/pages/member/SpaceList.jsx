import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getSpaces, getSpaceTypes } from '../../api/spaces.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'

import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'

import { formatRupiah } from '../../utils/currency.js'
import { getImageUrl } from '../../utils/image.js'

export default function SpaceList() {
  const [spaces, setSpaces] = useState([])
  const [types, setTypes] = useState([])
  const [search, setSearch] = useState('')
  const [tipe, setTipe] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTypes = async () => {
    try {
      const res = await getSpaceTypes()
      const raw = unwrap(res).data
      setTypes(Array.isArray(raw) ? raw : [])
    } catch {
      // Non-critical
    }
  }

  const loadSpaces = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {}

      if (search) params.search = search
      if (tipe) params.tipe = tipe

      const res = await getSpaces(
        Object.keys(params).length > 0 ? params : undefined
      )

      const unwrapped = unwrap(res)
      const raw = unwrapped.data

      setSpaces(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTypes()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(loadSpaces, 300)

    return () => clearTimeout(timeout)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tipe])

  const typeOptions = (Array.isArray(types) ? types : []).map((t) =>
    typeof t === 'string'
      ? {
          value: t,
          label: t.replace('_', ' '),
        }
      : {
          value: t.value,
          label: t.label,
        }
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Eksplorasi Space
        </h1>

        <p className="mt-2 text-sm text-stone">
          Temukan ruang kerja yang sesuai dengan kebutuhanmu.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone/50 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama space..."
            className="w-full rounded-lg border border-stone/15 bg-white pl-11 pr-4 py-3 text-sm text-ink outline-none transition focus:border-forest/30 focus:ring-2 focus:ring-forest/10 placeholder:text-stone/50"
          />
        </div>

        <div className="sm:w-56">
          <Select
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            options={[
              {
                value: '',
                label: 'Semua tipe space',
              },
              ...typeOptions,
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={loadSpaces}
        />
      ) : spaces.length === 0 ? (
        <EmptyState
          title="Space tidak ditemukan"
          description="Coba ubah kata pencarian atau pilih tipe space lainnya."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => {
            const image = getImageUrl(space.foto)

            return (
              <Link
                key={space.id}
                to={`/member/spaces/${space.id}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    {image ? (
                      <img src={getImageUrl(space.foto, 'spaces')} alt={space.nama_space} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-stone">
                        Tidak ada gambar
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm">
                      {space.tipe}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-lg font-semibold text-ink group-hover:text-forest transition-colors">
                          {space.nama_space}
                        </h2>

                        <p className="mt-1 text-sm text-stone">
                          Kapasitas {space.kapasitas} orang
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold text-ink">
                          {formatRupiah(space.harga_per_jam)}
                        </p>

                        <p className="text-xs text-stone">
                          / jam
                        </p>
                      </div>
                    </div>

                    {space.deskripsi && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone">
                        {space.deskripsi}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-stone/10 pt-4">
                      <span className="text-sm font-medium text-forest">
                        Lihat detail
                      </span>

                      <svg
                        className="h-4 w-4 text-forest transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M5 12h14m-6-6 6 6-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}