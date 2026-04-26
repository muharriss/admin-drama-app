# Servis Pengguna

## Merupakan servis read-only untuk melihat data pengguna aplikasi, history nonton, bookmark, dan watch time

---

A. Semua endpoint menggunakan header `Authorization` dengan value `Bearer <token>`.

B. Endpoint pada modul ini memerlukan permission role modul `pengguna`.

C. Servis menggunakan path tambahan : `/pengguna`

D. Filter tanggal `registeredStartDate`, `registeredEndDate`, `startDate`, dan `endDate` menggunakan format `YYYY-MM-DD` dan akan diparsing sesuai `PENGGUNA_TIMEZONE` pada backend.

---

1. Daftar Pengguna

- Digunakan untuk melihat daftar pengguna aplikasi secara pagination;
- **endpoint** : /:page/:limit
- _:page_ adalah halaman data;
- _:limit_ adalah jumlah data per halaman;
- **Query Params**:
  - `nama` (optional)
  - `email` (optional)
  - `telegramId` (optional)
  - `googleId` (optional)
  - `platform` (optional, `telegram` atau `android`)
  - `linked` (optional, `true` atau `false`)
  - `registeredStartDate` (optional, format `YYYY-MM-DD`)
  - `registeredEndDate` (optional, format `YYYY-MM-DD`)
  - `sortby` (optional, `registeredAt` atau `nama`)
  - `sortorder` (optional, `ASC` atau `DESC`)
- Request **GET**
- Field `registeredStartDate` dan `registeredEndDate` dibaca sebagai tanggal lokal modul `pengguna`, lalu backend mengonversinya ke UTC berdasarkan `PENGGUNA_TIMEZONE`.

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69c79d185150422376488a4e",
      "telegramId": null,
      "googleId": "102997197913417293812",
      "email": "very.shafrudin@gmail.com",
      "nama": "Very Shafrudin",
      "linkedAt": null,
      "registeredAt": "2026-03-28T09:19:20.443Z",
      "hasTelegram": false,
      "hasGoogle": true,
      "sourcePlatform": "android",
      "isLinked": false,
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
      "platform": "android",
      "sortby": "registeredAt",
      "sortorder": "DESC"
    }
  }
}
```

2. Detail Pengguna

- Digunakan untuk melihat detail satu pengguna beserta ringkasan aktivitasnya;
- **endpoint** : /:id/detail
- _:id_ adalah ObjectId user;
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": {
    "_id": "69b9922fea3877345ba690ef",
    "telegramId": null,
    "googleId": "102997197913417293812",
    "email": "very.shafrudin@gmail.com",
    "nama": "Very Shafrudin",
    "linkedAt": null,
    "registeredAt": "2026-03-17T17:41:03.881Z",
    "hasTelegram": false,
    "hasGoogle": true,
    "sourcePlatform": "android",
    "isLinked": false,
    "linkedAccounts": {
      "telegram": null,
      "android": null
    },
    "summary": {
      "historyCount": 2,
      "bookmarkCount": 1,
      "watchTimeCount": 0,
      "latestWatchTime": null
    }
  }
}
```

3. History Nonton

- Digunakan untuk melihat histori tontonan lintas pengguna atau user tertentu;
- **endpoint** : /history/:page/:limit
- **Query Params**:
  - `userId` (optional)
  - `provider` (optional)
  - `platform` (optional)
  - `dramaTitle` (optional)
  - `startDate` (optional, format `YYYY-MM-DD`)
  - `endDate` (optional, format `YYYY-MM-DD`)
- Request **GET**
- Field `startDate` dan `endDate` dibaca sebagai tanggal lokal modul `pengguna`, lalu backend mengonversinya ke UTC berdasarkan `PENGGUNA_TIMEZONE`.

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69e7950ad3c30700c300739b",
      "userId": "69ca2a6de3482bd3c44d8abc",
      "user": {
        "_id": "69ca2a6de3482bd3c44d8abc",
        "nama": "Muhammad Firshan",
        "telegramId": "302491673",
        "googleId": null,
        "sourcePlatform": "telegram"
      },
      "dramaId": "7629383773880077317",
      "dramaTitle": "(dubbing)Dokter Sakti Jadi Rebutan",
      "provider": "melolo",
      "episodeId": "18",
      "nomorEpisode": 18,
      "platform": "telegram",
      "updatedAt": "2026-04-22T05:00:40.965Z",
      "nomor": 1
    }
  ],
  "meta": {
    "user": null,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "filters": {
      "provider": "melolo",
      "sortby": "updatedAt",
      "sortorder": "DESC"
    }
  }
}
```

* **Contoh Hasil Jika Gagal :**

```json
{
  "message": "Validasi gagal",
  "errors": {
    "userId": ["Tipe data tidak valid"]
  },
  "code": "VALIDATION_ERROR"
}
```

4. Bookmark Pengguna

- Digunakan untuk melihat bookmark lintas pengguna atau user tertentu;
- **endpoint** : /bookmark/:page/:limit
- **Query Params**:
  - `userId` (optional)
  - `provider` (optional)
  - `platform` (optional)
  - `dramaTitle` (optional)
  - `startDate` (optional, format `YYYY-MM-DD`)
  - `endDate` (optional, format `YYYY-MM-DD`)
- Request **GET**
- Field `startDate` dan `endDate` dibaca sebagai tanggal lokal modul `pengguna`, lalu backend mengonversinya ke UTC berdasarkan `PENGGUNA_TIMEZONE`.

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69e60e5ea335a7a8efaa829c",
      "userId": "69c7ee1ec5837c011b9733b7",
      "user": {
        "_id": "69c7ee1ec5837c011b9733b7",
        "nama": "User Telegram",
        "telegramId": "1174166707",
        "sourcePlatform": "telegram"
      },
      "dramaId": "42000007205",
      "dramaTitle": "The One That Got Away",
      "provider": "dramabox",
      "platform": "telegram",
      "updatedAt": "2026-04-20T11:30:38.049Z",
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
      "dramaTitle": "huruf",
      "sortby": "updatedAt",
      "sortorder": "DESC"
    }
  }
}
```

5. Watch Time Pengguna

- Digunakan untuk melihat watch time bulanan lintas pengguna;
- **endpoint** : /watch-time/:page/:limit
- **Query Params**:
  - `userId` (optional)
  - `year` (optional)
  - `month` (optional)
  - `platform` (optional)
  - `sortby` (optional, `year`, `month`, `totalSeconds`, `updatedAt`)
  - `sortorder` (optional, `ASC` atau `DESC`)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69cd0e4aa6f9b9031a33a2ab",
      "year": 2026,
      "month": 4,
      "totalSeconds": 24,
      "totalMinutes": 0.4,
      "totalHours": 0.01,
      "platform": "android",
      "nomor": 1,
      "userId": "69c79d185150422376488a4e",
      "user": {
        "_id": "69c79d185150422376488a4e",
        "nama": "Very Shafrudin",
        "email": "very.shafrudin@gmail.com",
        "googleId": "102997197913417293812",
        "sourcePlatform": "android"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "summary": {
      "totalSeconds": 24,
      "totalMinutes": 0.4,
      "totalHours": 0.01
    },
    "filters": {
      "platform": "android",
      "sortby": "year",
      "sortorder": "DESC"
    }
  }
}
```

6. Watch Time Per User

- Digunakan untuk melihat watch time bulanan milik user tertentu melalui path param;
- **endpoint** : /:id/watch-time/:page/:limit
- _:id_ adalah ObjectId user;
- **Query Params**:
  - `year` (optional)
  - `month` (optional)
  - `platform` (optional)
  - `sortby` (optional)
  - `sortorder` (optional)
- Request **GET**

* **Contoh Hasil Jika Sukses :**

```json
{
  "data": [
    {
      "_id": "69cfbc86050c967bb988d7db",
      "year": 2026,
      "month": 4,
      "totalSeconds": 132,
      "totalMinutes": 2.2,
      "totalHours": 0.04,
      "platform": "telegram",
      "nomor": 1,
      "userId": "69c8cff636744dcb31104b6c"
    }
  ],
  "meta": {
    "user": {
      "_id": "69c8cff636744dcb31104b6c",
      "nama": "mr bre"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "summary": {
      "totalSeconds": 132,
      "totalMinutes": 2.2,
      "totalHours": 0.04
    },
    "filters": {
      "userId": "69c8cff636744dcb31104b6c",
      "sortby": "month",
      "sortorder": "ASC"
    }
  }
}
```
