# Servis User Admin

## Merupakan servis untuk mengelola data user admin dan akses modul yang dimiliki setiap admin

---

A. Semua endpoint pada modul ini menggunakan header `Authorization` dengan value `Bearer <token>`.

B. Sebagian besar endpoint memerlukan permission role modul `user-admin`. Endpoint `GET /info/:id` hanya memerlukan token aktif.

C. Servis menggunakan path tambahan : `/user-admin`

---

1. Daftar User Admin

- Digunakan untuk menampilkan daftar user admin secara pagination;
- **endpoint** : /user/:page/:limit
- _:page_ adalah halaman data;
- _:limit_ adalah jumlah data per halaman;
- **Query Params**:
  - `username` (optional)
  - `nama` (optional)
  - `status` (optional, TRUE/FALSE)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "65474decabfa4c1e74526510",
      "username": "UDINFM",
      "nama": "UDIN FM",
      "status": true,
      "nomor": 1
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
      "username": "UDIN"
    }
  }
}
```

2. Detail User Admin

- Digunakan untuk melihat detail satu user admin beserta daftar akses modulnya;
- **endpoint** : /user/:id/detail
- _:id_ adalah ObjectId user admin;
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "_id": "65474decabfa4c1e74526510",
    "username": "UDINFM",
    "nama": "UDIN FM",
    "status": true,
    "akses": [
      {
        "_id": "100",
        "akses": "Manajemen Provider",
        "keterangan": "Manajemen terkait data provider",
        "method": ["GET", "POST", "PUT", "PATCH", "DELETE"]
      }
    ]
  }
}
```

3. Info Nama User Admin

- Digunakan untuk mengambil nama singkat user admin berdasarkan ID;
- **endpoint** : /info/:id
- _:id_ adalah ObjectId user admin;
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": "UDIN FM"
}
```

4. Daftar Modul Akses

- Digunakan untuk melihat master modul yang dapat diberikan ke user admin;
- **endpoint** : /user/modul
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "100",
      "akses": "Manajemen Provider",
      "keterangan": "Manajemen terkait data provider"
    }
  ]
}
```

5. Create User Admin

- Digunakan untuk membuat user admin baru;
- **endpoint** : /user
- Request **POST**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `username` (string, required)
  - `nama` (string, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Input data berhasil",
  "data": {
    "id": "69e51968a6928ad8791050f2"
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Username HARRIS sudah digunakan",
  "code": "CONFLICT"
}
```

6. Set / Ganti Akses User

- Digunakan untuk mengganti seluruh daftar akses modul milik user admin;
- **endpoint** : /user/akses
- Request **POST**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `id` (ObjectId user admin, required)
  - `akses` (required, dapat dikirim berulang)
- Nilai field `akses` berisi string JSON dengan format:

```json
{"id":"100","method":["GET","POST","PUT","PATCH","DELETE"]}
```

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Input data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "ID Modul 101 tidak valid",
  "code": "NOT_FOUND"
}
```

7. Update Data User Admin

- Digunakan untuk mengubah data dasar user admin;
- **endpoint** : /user
- Request **PUT**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `id` (ObjectId user admin, required)
  - `nama` (string, optional)
  - `username` (string, optional)
  - `status` (TRUE/FALSE, optional)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

8. Reset Password User Admin

- Digunakan untuk mereset password user ke password default berbasis username;
- **endpoint** : /user/password
- Request **PUT**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `id` (ObjectId user admin, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Update data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "User masih menggunakan password default",
  "code": "BAD_REQUEST"
}
```

9. Hapus Akses User

- Digunakan untuk menghapus satu modul akses atau satu method akses milik user admin;
- **endpoint** : /user/akses
- Request **DELETE**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `id` (ObjectId user admin, required)
  - `akses` (kode modul, required)
  - `method` (GET/POST/PUT/PATCH/DELETE, optional)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Hapus data berhasil"
}
```

10. Hapus User Admin

- Digunakan untuk menghapus user admin;
- **endpoint** : /user
- Request **DELETE**
- Pada body menggunakan **x-www-form-urlencoded**:
  - `id` (ObjectId user admin, required)

* **Contoh Hasil Jika Sukses :**

```json
{
  "message": "Hapus data berhasil"
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Anda tidak dapat menghapus akun anda",
  "code": "BAD_REQUEST"
}
```
