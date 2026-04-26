# Servis Provider

## Merupakan servis untuk mengelola master data provider aplikasi Drama Apps

---

A. Semua endpoint menggunakan header `Authorization` dengan value `Bearer <token>`.

B. Endpoint pada modul ini memerlukan permission role modul `provider`.

C. Servis menggunakan path tambahan : `/provider`

---

1. Daftar Provider

- Digunakan untuk menampilkan daftar provider secara pagination;
- **endpoint** : /:page/:limit
- _:page_ adalah halaman data;
- _:limit_ adalah jumlah data per halaman;
- **Query Params**:
  - `nama` (optional)
  - `keterangan` (optional)
  - `status` (optional, TRUE/FALSE)
  - `default` (optional, TRUE/FALSE)
  - `sortby` (optional, `urutan` atau `nama`)
  - `sortorder` (optional, `ASC` atau `DESC`)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "M",
      "nama": "MicroDrama",
      "keterangan": "Provider short drama dari MicroDrama",
      "icon": "https://example.com/microdrama.png",
      "status": true,
      "default": false,
      "free": 10,
      "urutan": 1
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
      "sortby": "urutan",
      "sortorder": "DESC"
    }
  }
}
```

2. Detail Provider

- Digunakan untuk melihat detail provider;
- **endpoint** : /:id/detail
- _:id_ adalah ID provider, hanya boleh huruf uppercase A-Z;
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "_id": "A",
    "nama": "MELOLO",
    "keterangan": "Source Provider Melolo",
    "icon": "https://melolo.com/favicon.png",
    "status": true,
    "default": false,
    "free": 10,
    "urutan": 1
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Data provider tidak ditemukan",
  "code": "NOT_FOUND"
}
```

3. Input Provider

- Digunakan untuk membuat provider baru;
- **endpoint** : /
- Request **POST**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (string, required, hanya A-Z)
  - `nama` (string, required)
  - `keterangan` (string, required)
  - `icon` (string, required, full URL)
  - `free` (integer, required)
  - `urutan` (integer, required)
- Field `status` dan `default` akan otomatis disimpan `false` saat create.

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Input data berhasil",
  "data": {
    "id": "AZ"
  }
}
```

4. Update Data Provider

- Digunakan untuk mengubah data provider secara partial;
- **endpoint** : /
- Request **PUT**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (required)
  - `nama` (optional)
  - `keterangan` (optional)
  - `icon` (optional)
  - `free` (optional)
  - `urutan` (optional)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Inputkan data yang akan anda edit",
  "code": "BAD_REQUEST"
}
```

5. Toggle Status Provider

- Digunakan untuk mengaktifkan atau menonaktifkan provider;
- **endpoint** : /status
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

6. Toggle Default Provider

- Digunakan untuk mengubah status default provider;
- **endpoint** : /default
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (required)
- Saat toggle ke `true`, backend akan otomatis mencabut default provider lain.

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

7. Swap Urutan Provider

- Digunakan untuk menukar urutan dua provider;
- **endpoint** : /swap-urutan
- Request **PATCH**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `firstId` (required)
  - `secondId` (required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Swap urutan berhasil"
}
```

8. Hapus Provider

- Digunakan untuk menghapus provider;
- **endpoint** : /
- Request **DELETE**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `_id` (required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Hapus data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Provider default tidak dapat dihapus sebelum default dipindahkan",
  "code": "CONFLICT"
}
```
