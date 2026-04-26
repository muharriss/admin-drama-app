# Backend Admin API Documentation

---

A. Dokumentasi API admin ini dibagi berdasarkan servis / modul aplikasi yang ada:

1. [Auth](./Auth/README.md) - Servis autentikasi admin, session, token aktif, dan profile admin aktif
2. [User Admin](./UserAdmin/README.md) - Servis manajemen user admin dan akses modul
3. [Provider](./Provider/README.md) - Servis master data provider aplikasi
4. [Token](./Token/README.md) - Servis master data token bisnis dan histori penggunaannya
5. [Pengguna](./Pengguna/README.md) - Servis observasi data pengguna aplikasi, history, bookmark, dan watch time

B. Base URL / endpoint utama yang digunakan:

- Base URL mengikuti deployment service `https://belajarbaca.xyz/admin/backend/`
- Prefix route utama:
  - `/auth`
  - `/user-admin`
  - `/provider`
  - `/token`
  - `/pengguna`

C. Header yang digunakan:

- `Key: XuioakMhgre156Hbxjutavnsjuy` untuk endpoint modul `auth-admin`
- `Authorization: Bearer <token>` untuk endpoint yang memerlukan session login admin aktif

D. Format response yang digunakan backend admin:

- **Contoh Hasil Jika Sukses :**

```json
{
  "message": "optional",
  "data": {},
  "meta": {}
}
```

- **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Terjadi error pada data",
  "errors": {},
  "code": "INTERNAL_SERVER_ERROR"
}
```

E. Catatan tambahan:

- Backend admin ini memakai format response RESTful baru, bukan format lama `hasil` / `pesan`
- Untuk request body form, endpoint yang menerima body form menggunakan format `x-www-form-urlencoded`
