import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSpaceById, getSpaceAvailability } from '../../api/spaces.js'
import { checkPromo } from '../../api/diskon.js'
import { createReservasi } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah, toNumber } from '../../utils/currency.js'
import SpaceImage from '../../components/common/SpaceImage.jsx'
import { isValidApiDate, isValidApiTime, formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'

export default function SpaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ tanggal_reservasi: '', jam_mulai: '', durasi_jam: 1, kode_promo: '' })
  const [formErrors, setFormErrors] = useState({})
  const [availability, setAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [promo, setPromo] = useState(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  const loadSpace = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSpaceById(id)
      setSpace(unwrap(res).data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSpace() }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setAvailability(null)
  }

  // Validates the booking form; returns an { field: message } map.
  const validateBookingForm = () => {
    const errs = {}
    if (!isValidApiDate(form.tanggal_reservasi)) errs.tanggal_reservasi = 'Pilih tanggal (YYYY-MM-DD)'
    if (!isValidApiTime(form.jam_mulai)) errs.jam_mulai = 'Pilih jam (HH:mm)'
    if (!(Number(form.durasi_jam) >= 1)) errs.durasi_jam = 'Minimal 1 jam'
    return errs
  }

const handleCheckAvailability = async () => {
  const errs = validateBookingForm()
  setFormErrors(errs)

  if (Object.keys(errs).length > 0) return

  setCheckingAvailability(true)

  try {
    const res = await getSpaceAvailability({
      id_space: Number(id),
      tanggal_reservasi: form.tanggal_reservasi,
      jam_mulai: form.jam_mulai,
      durasi_jam: Number(form.durasi_jam),
    })

    const data = unwrap(res).data

    console.log(
      'AVAILABILITY FULL:',
      JSON.stringify(data, null, 2)
    )

    const space = Array.isArray(data)
      ? data.find((item) => Number(item.id) === Number(id))
      : null

    if (!space) {
      setAvailability({
        tersedia: false,
        message: 'Data ketersediaan space tidak ditemukan.',
      })
      return
    }

    const requestedDate = form.tanggal_reservasi
    const requestedStart = form.jam_mulai
    const requestedDuration = Number(form.durasi_jam)

    const requestedStartMinutes = (() => {
      const [hour, minute] = requestedStart.split(':').map(Number)
      return hour * 60 + minute
    })()

    const requestedEndMinutes =
      requestedStartMinutes + requestedDuration * 60

    const activeBookings = (space.detail_reservasi || []).filter(
      (detail) => {
        const reservation = detail?.reservasi

        if (!reservation) return false

        // Reservasi yang sudah dibatalkan tidak dianggap bentrok.
        if (reservation.status === 'dibatalkan') return false

        const reservationDate =
          reservation.tanggal_reservasi?.slice(0, 10)

        if (reservationDate !== requestedDate) return false

        const [hour, minute] = reservation.jam_mulai
          .split(':')
          .map(Number)

        const reservationStart = hour * 60 + minute
        const reservationEnd =
          reservationStart + Number(reservation.durasi_jam) * 60

        // Cek apakah kedua rentang waktu saling overlap.
        return (
          requestedStartMinutes < reservationEnd &&
          requestedEndMinutes > reservationStart
        )
      }
    )
if (activeBookings.length > 0) {
  const booking = activeBookings[0].reservasi

  const [hour, minute] = booking.jam_mulai.split(':').map(Number)

  const startMinutes = hour * 60 + minute
  const endMinutes =
    startMinutes + Number(booking.durasi_jam) * 60

  const endHour = Math.floor(endMinutes / 60) % 24
  const endMinute = endMinutes % 60

  const endTime =
    `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

  setAvailability({
    tersedia: false,
    message:
      `Space sudah terbooking hingga pukul ${endTime}. ` +
      `Silakan pilih waktu lain.`,
  })

  return
}

    setAvailability({
      tersedia: true,
      message: 'Space tersedia dan siap dipesan.',
    })
  } catch (err) {
    setAvailability({
      tersedia: false,
      message: getErrorMessage(err),
    })
  } finally {
    setCheckingAvailability(false)
  }
}

  const handleCheckPromo = async () => {
    if (!form.kode_promo) return
    setCheckingPromo(true)
    try {
      const res = await checkPromo({ nama_diskon: form.kode_promo })
      const promoData = unwrap(res).data
      if (promoData && promoData.diskon) {
        setPromo(promoData.diskon)
        toast.success(promoData.message || 'Kode promo berhasil digunakan')
      } else {
        setPromo(null)
        toast.error('Kode promo tidak valid atau kadaluarsa')
      }
    } catch (err) {
      setPromo(null)
      toast.error(getErrorMessage(err))
    } finally {
      setCheckingPromo(false)
    }
  }

  const handleBook = async () => {
    // Validate BEFORE calling the API. Previously an empty form was sent as-is,
    // the API answered with a validation-error payload and that payload (an
    // array/object) was handed to toast()/JSX, crashing React into a white screen.
    const errs = validateBookingForm()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Lengkapi tanggal, jam mulai, dan durasi terlebih dahulu.')
      return
    }

    setIsBooking(true)
    try {
      const payload = {
        id_space: Number(id),
        tanggal_reservasi: form.tanggal_reservasi,
        jam_mulai: form.jam_mulai,
        durasi_jam: Number(form.durasi_jam),
      }
      if (promo && promo.id) payload.id_diskon = promo.id
      if (form.kode_promo) payload.kode_promo = form.kode_promo

      const res = await createReservasi(payload)
      const { data: raw, message } = unwrap(res)
      const created = normalizeReservasi(raw)
      toast.success(typeof message === 'string' && message ? message : 'Reservasi berhasil dibuat!')

      if (created) {
        setBookingResult(created)
      } else {
        // Unexpected payload: the booking itself succeeded, so don't leave the user hanging.
        navigate('/member/reservasi')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsBooking(false)
    }
  }

  const handleNavigateAfterBooking = () => {
    const targetId = bookingResult?.id
    navigate(targetId ? `/member/reservasi/${targetId}` : '/member/reservasi')
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={loadSpace} />
  if (!space) return null

  const hargaPerJam = toNumber(space.harga_per_jam) ?? 0
  const durasi = Number(form.durasi_jam) || 0
  const totalAwal = hargaPerJam * durasi
  const persentaseDiskon = toNumber(promo?.persentase_diskon) ?? 0
  const estimasiPotongan = persentaseDiskon > 0 ? Math.round(totalAwal * persentaseDiskon / 100) : 0
  const estimasiTotalBayar = Math.max(totalAwal - estimasiPotongan, 0)

  if (bookingResult) {
    return (
      <div className="max-w-md mx-auto mt-8 animate-fade-in">
        <Card className="p-8 text-center border-moss/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest text-white mb-6 shadow-soft">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Reservasi Berhasil!</h2>
          <p className="text-stone text-sm mb-8">Reservasi Anda untuk {space.nama_space} sedang diproses.</p>

          <div className="bg-sand/30 rounded-lg p-5 mb-8 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center text-stone">
              <span>Waktu</span><span className="font-medium text-ink">{formatDateDisplay(bookingResult.tanggal_reservasi)} · {bookingResult.jam_mulai}</span>
            </div>
            <div className="flex justify-between items-center text-stone">
              <span>Durasi</span><span className="font-medium text-ink">{bookingResult.durasi_jam ?? durasi} jam</span>
            </div>
            {(bookingResult.potongan_diskon > 0) && (
              <div className="flex justify-between items-center text-forest">
                <span>Diskon</span><span>-{formatRupiah(bookingResult.potongan_diskon)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-semibold text-ink pt-3 border-t border-stone/10 text-base">
              <span>Total Bayar</span><span>{formatRupiah(bookingResult.total_bayar)}</span>
            </div>
          </div>

          <Button type="button" className="w-full" size="lg" onClick={handleNavigateAfterBooking}>
            Lihat Detail Reservasi
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
      {/* Left Column: Details */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        <div className="rounded-2xl overflow-hidden bg-sand aspect-video relative">
          <SpaceImage
            space={space}
            fallback={<div className="w-full h-full flex items-center justify-center text-stone">Tidak ada foto</div>}
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ink shadow-sm">
            {space.tipe?.replace('_', ' ')}
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl font-semibold text-ink mb-2 tracking-tight">{space.nama_space}</h1>
              <div className="flex items-center gap-4 text-sm text-stone">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Kapasitas {space.kapasitas} orang
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="block font-display text-2xl font-semibold text-clay">{formatRupiah(space.harga_per_jam)}</span>
              <span className="text-sm text-stone">/ jam</span>
            </div>
          </div>

          <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-ink/80 leading-relaxed">
            <h3 className="font-display text-xl font-semibold text-ink mb-4">Tentang Space Ini</h3>
            <p className="whitespace-pre-wrap">{space.deskripsi}</p>
          </div>
        </div>
      </div>

      {/* Right Column: Booking Panel */}
      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
        <Card className="p-6 md:p-8 space-y-6 border-stone/10 shadow-elevated">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink mb-1">Reservasi</h3>
            <p className="text-sm text-stone">Pilih jadwal untuk mengecek ketersediaan.</p>
          </div>

          <div className="space-y-4">
            <Input label="Tanggal" type="date" name="tanggal_reservasi" value={form.tanggal_reservasi} onChange={handleChange} error={formErrors.tanggal_reservasi} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Jam Mulai" type="time" name="jam_mulai" value={form.jam_mulai} onChange={handleChange} error={formErrors.jam_mulai} />
              <Input label="Durasi (Jam)" type="number" min={1} name="durasi_jam" value={form.durasi_jam} onChange={handleChange} error={formErrors.durasi_jam} />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleCheckAvailability} isLoading={checkingAvailability}>
              Cek Ketersediaan
            </Button>

            {availability && (
              <div className={`p-4 rounded-lg text-sm border flex gap-3 animate-fade-in ${availability?.tersedia === false ? 'bg-brick/5 border-brick/20 text-brick' : 'bg-forest/5 border-forest/20 text-forest'}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {availability?.tersedia === false
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                </svg>
                <span>{(typeof availability?.message === 'string' && availability.message) || (availability?.tersedia === false ? 'Space tidak tersedia pada waktu ini.' : 'Space tersedia dan siap dipesan.')}</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone/10">
            <label className="block text-sm font-medium text-ink mb-2">Punya Kode Promo?</label>
            <div className="flex gap-2">
              <Input placeholder="KODE..." name="kode_promo" value={form.kode_promo} onChange={handleChange} className="flex-1 uppercase font-mono" />
              <Button type="button" variant="secondary" onClick={handleCheckPromo} isLoading={checkingPromo}>Terapkan</Button>
            </div>

            {promo && (
              <div className="mt-3 p-3 rounded-md bg-forest/10 border border-forest/20 text-forest text-sm flex items-center justify-between animate-fade-in">
                <span className="font-medium">{promo.nama_diskon || form.kode_promo}</span>
                <span className="font-semibold px-2 py-0.5 bg-forest text-white rounded text-xs">-{promo.persentase_diskon}%</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone/10 space-y-3 text-sm">
            <div className="flex justify-between items-center text-stone">
              <span>Biaya {durasi} jam</span>
              <span className="text-ink">{formatRupiah(totalAwal)}</span>
            </div>
            {promo && estimasiPotongan > 0 && (
              <div className="flex justify-between items-center text-forest">
                <span>Diskon</span>
                <span>-{formatRupiah(estimasiPotongan)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-stone/10 font-display text-lg font-semibold text-ink">
              <span>Total Bayar</span>
              <span className="text-clay">{formatRupiah(estimasiTotalBayar)}</span>
            </div>
          </div>

          <Button type="button" className="w-full text-base py-3.5" size="lg" onClick={handleBook} isLoading={isBooking} disabled={isBooking || availability?.tersedia === false}>
            Pesan Ruang Sekarang
          </Button>
        </Card>
      </div>
    </div>
  )
}
