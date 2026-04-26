# Servis Auth

## Merupakan servis untuk autentikasi admin, pengelolaan sesi aktif, validasi token, dan profile admin yang sedang login

---

A. Semua endpoint pada modul ini menggunakan header `Key` dengan value API Key yang valid.

B. Endpoint selain `captcha` dan `login` juga memerlukan header `Authorization` dengan value `Bearer <token>`.

C. Servis menggunakan path tambahan : `/auth`

---

1. Captcha Login

- Digunakan untuk mengambil captcha login jika fitur captcha diaktifkan pada backend;
- **endpoint** : /captcha
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "gambar": "<svg ...></svg>",
    "hash": "cc0804531051b62ccf6a91f1e1166f49..."
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "API key tidak valid",
  "code": "UNAUTHORIZED"
}
```

2. Login

- Digunakan untuk login admin dan membuat session token baru;
- **endpoint** : /sessions
- Request **POST**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `username` (string, required)
  - `password` (string, required)
  - `hash` (string, optional, diperlukan jika captcha aktif)
  - `jawaban` (string, optional, diperlukan jika captcha aktif)

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "grant": "Bearer",
    "token": "c19ca93c-06e0-42be-98fc-6283e092ee45",
    "iduser": "65474decabfa4c1e74526510",
    "user": {
      "nama": "VERY SHAFRUDIN",
      "username": "UDINFM",
      "status": true,
      "akses": [
        {
          "_id": "100",
          "akses": "Manajemen Provider",
          "keterangan": "Manajemen terkait data provider",
          "method": ["GET", "POST", "PUT", "DELETE"]
        }
      ]
    }
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Validasi gagal",
  "errors": {
    "general": ["Captcha telah expire"]
  },
  "code": "VALIDATION_ERROR"
}
```

3. Logout

- Digunakan untuk logout dari session aktif saat ini;
- **endpoint** : /sessions/current
- Request **DELETE**

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Logout berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Token akses tidak ditemukan pada sistem",
  "code": "UNAUTHORIZED"
}
```

4. Cek Token Aktif

- Digunakan untuk mengecek apakah token yang sedang dipakai masih valid;
- **endpoint** : /tokens/current
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "iduser": "65474decabfa4c1e74526510",
    "namauser": "VERY SHAFRUDIN"
  }
}
```

5. Cek Permission Role

- Digunakan untuk mengecek apakah user memiliki akses modul tertentu dengan method tertentu;
- **endpoint** : /permissions
- **Query Params**:
  - `role` (kode modul, required)
  - `method` (GET/POST/PUT/PATCH/DELETE, required)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "iduser": "65474decabfa4c1e74526510",
    "namauser": "VERY SHAFRUDIN"
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Akses dengan kode modul 100 dengan method DELETE tidak ditemukan",
  "code": "FORBIDDEN"
}
```

6. Info User Aktif

- Digunakan untuk melihat profile admin yang sedang login;
- **endpoint** : /users/me
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "iduser": "65474decabfa4c1e74526510",
    "username": "UDINFM",
    "nama": "VERY SHAFRUDIN",
    "status": "true",
    "akses": [
      {
        "_id": "100",
        "akses": "Manajemen Provider",
        "keterangan": "Manajemen terkait data provider",
        "method": ["GET", "POST", "PUT", "DELETE"]
      }
    ]
  }
}
```

7. Log Login

- Digunakan untuk melihat histori login admin yang sedang aktif;
- **endpoint** : /login-logs
- **Query Params**:
  - `page` (required)
  - `limit` (required)
  - `sortorder` (optional, ASC atau DESC)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69e50949f3c4b886e7a273e1",
      "device": "Chrome",
      "keterangan": "Browser:Chrome 135.0 || Operating System:Windows || Platform:Win32",
      "ip": "::ffff:127.0.0.1",
      "createdAt": "2026-04-19T16:41:45.199Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "filters": {
      "sortorder": "ASC"
    }
  }
}
```

8. Daftar Token Aktif

- Digunakan untuk melihat seluruh token aktif milik user yang sedang login;
- **endpoint** : /tokens
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "c19ca93c-06e0-42be-98fc-6283e092ee45",
      "device": "Chrome",
      "ip": "::ffff:127.0.0.1",
      "createdAt": "2026-04-19T17:11:22.447Z",
      "nomor": 1,
      "isYou": true
    }
  ]
}
```

9. Ganti Password

- Digunakan untuk mengganti password admin yang sedang login;
- **endpoint** : /users/me/password
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `lama` (string, required)
  - `baru` (string, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Ganti Password berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Password baru anda harus berbeda dengan password lama",
  "code": "BAD_REQUEST"
}
```

10. Ganti Nama

- Digunakan untuk mengganti nama admin yang sedang login;
- **endpoint** : /users/me/profile
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `nama` (string, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Ganti Nama berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Nama anda tidak mengalami perubahan",
  "code": "CONFLICT"
}
```

11. Hapus Token Aktif

- Digunakan untuk menghapus salah satu token aktif milik sendiri;
- **endpoint** : /tokens/:id
- _:id_ adalah ID token aktif yang akan dihapus;
- Request **DELETE**

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Hapus data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Anda tidak dapat menghapus token yang sedang anda gunakan saat ini",
  "code": "CONFLICT"
}
```
