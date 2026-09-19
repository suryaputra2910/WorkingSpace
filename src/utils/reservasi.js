export function normalizeReservasi(r) {
  if (!r) return null;
  
  // POST /api/reservasi has price_breakdown
  const pb = r.price_breakdown;
  const detail = Array.isArray(r.detail_reservasi) ? r.detail_reservasi[0] : null;
  const space = detail?.space || r.space || {};
  const diskon = detail?.diskon || r.diskon || null;
  
  const hargaPerJam = pb?.harga_per_jam ?? space.harga_per_jam ?? r.harga_per_jam;
  const durasiJam = pb?.durasi_jam ?? r.durasi_jam;
  const totalHargaAwal = pb?.subtotal ?? r.total_harga_awal ?? (hargaPerJam != null && durasiJam != null ? hargaPerJam * durasiJam : null);
  const totalBayar = pb?.total_harga ?? detail?.total_harga ?? r.total_bayar;
  
  let potonganDiskon = pb?.nominal_diskon ?? r.potongan_diskon;
  if (potonganDiskon == null && totalHargaAwal != null && totalBayar != null) {
    // If backend doesn't provide nominal_diskon in GET, we calculate from the difference
    potonganDiskon = totalHargaAwal - totalBayar;
  }
  
  return {
    ...r,
    kode_booking: r.kode_booking,
    nama_space: space.nama_space ?? r.nama_space,
    harga_per_jam: hargaPerJam,
    durasi_jam: durasiJam,
    total_harga_awal: totalHargaAwal,
    potongan_diskon: potonganDiskon > 0 ? potonganDiskon : 0,
    total_bayar: totalBayar,
    status: r.status,
  };
}
