# Servis Token

## Merupakan servis untuk mengelola master data token bisnis dan histori penggunaannya

---

A. Semua endpoint menggunakan header `Authorization` dengan value `Bearer <token>`.

B. Endpoint pada modul ini memerlukan permission role modul `token`.

C. Servis menggunakan path tambahan : `/token`

D. Field `expiredAt` dikirim dengan format `YYYY-MM-DD HH:mm` dan akan diparsing sesuai `TOKEN_TIMEZONE` pada backend.

---

1. Daftar Token

- Digunakan untuk menampilkan daftar token tanpa pagination;
- **endpoint** : /
- **Query Params**:
  - `token` (optional)
  - `status` (optional, TRUE/FALSE)
  - `expired` (optional, TRUE/FALSE/ACTIVE/EXPIRED)
  - `sortby` (optional, `ORDER`, `TOKEN`, `EXPIREDAT`)
  - `sortorder` (optional, `ASC` atau `DESC`)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69a46e2ba67985de82328f24",
      "token": "A9054E33ABC4FB3C22F3F625014C70B1",
      "expiredAt": "2026-05-13T20:40:33.000Z",
      "status": true,
      "order": 1,
      "maxUse": 700000,
      "usageToday": 0,
      "isExpired": false,
      "isLimitReached": false,
      "effectiveStatus": true
    }
  ],
  "meta": {
    "total": 1,
    "filters": {
      "expired": false,
      "sortby": "order",
      "sortorder": "DESC"
    }
  }
}
```

2. Detail Token

- Digunakan untuk melihat detail satu token beserta status efektifnya;
- **endpoint** : /:id/detail
- _:id_ adalah ObjectId token;
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "_id": "699b25da792a07b7ea8c48a1",
    "token": "71BBD664A4B0C3217A586B9CC6007D17",
    "expiredAt": "2026-03-12T20:40:33.000Z",
    "status": true,
    "order": 2,
    "maxUse": 700000,
    "usageToday": 0,
    "isExpired": true,
    "isLimitReached": false,
    "effectiveStatus": false
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Validasi gagal",
  "errors": {
    "id": ["Tipe data tidak valid"]
  },
  "code": "VALIDATION_ERROR"
}
```

3. Histori Penggunaan Token

- Digunakan untuk melihat histori penggunaan token per hari;
- **endpoint** : /:id/usage
- _:id_ adalah ObjectId token;
- **Query Params**:
  - `startDate` (optional, format `YYYY-MM-DD`)
  - `endDate` (optional, format `YYYY-MM-DD`)
- Request **GET**
- Jika `startDate` dan `endDate` tidak dikirim, backend otomatis memakai rentang hari ini sampai 7 hari ke belakang.
- Pada modul token, `startDate` dan `endDate` diperlakukan sebagai string tanggal `YYYY-MM-DD` tanpa parsing timezone tambahan.

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69a472710aed095c9fff21e0",
      "tanggal": "2026-03-01",
      "tokenId": "69a46e2ba67985de82328f24",
      "jumlah": 6
    }
  ],
  "meta": {
    "tokenId": "69a46e2ba67985de82328f24",
    "token": "A9054E33ABC4FB3C22F3F625014C70B1",
    "range": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-10"
    },
    "summary": {
      "totalUsage": 43,
      "totalDays": 5
    }
  }
}
```

4. Input Token

- Digunakan untuk membuat token baru;
- **endpoint** : /
- Request **POST**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `token` (string, required)
  - `expiredAt` (string, required, format `YYYY-MM-DD HH:mm`)
  - `maxUse` (integer, required)
  - `order` (integer, required)
- Field `status` otomatis disimpan `true` saat create.

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Input data berhasil",
  "data": {
    "id": "69e7a477ba07611b3344501c"
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Token xuxuxuxuxux sudah digunakan oleh token yang belum expired",
  "code": "CONFLICT"
}
```

5. Update Token

- Digunakan untuk mengubah data token secara partial;
- **endpoint** : /
- Request **PUT**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (ObjectId token, required)
  - `token` (optional)
  - `expiredAt` (optional)
  - `maxUse` (optional)
  - `order` (optional)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

6. Toggle Status Token

- Digunakan untuk mengaktifkan atau menonaktifkan token;
- **endpoint** : /status
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (ObjectId token, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

7. Swap Urutan Token

- Digunakan untuk menukar urutan dua token;
- **endpoint** : /swap-urutan
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `firstId` (ObjectId token pertama, required)
  - `secondId` (ObjectId token kedua, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Swap urutan berhasil"
}
```

8. Hapus Token

- Digunakan untuk menghapus token beserta relasi `token-usage` miliknya;
- **endpoint** : /
- Request **DELETE**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (ObjectId token, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Hapus data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Data token tidak ditemukan",
  "code": "NOT_FOUND"
}
```
