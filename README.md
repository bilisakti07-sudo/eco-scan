# Eco Scan

A simple demo web app for waste identification using the camera and TensorFlow.js MobileNet.

Features:
- Kamera identifikasi jenis sampah (menggunakan MobileNet)
- History hasil scan disimpan di `localStorage`
- Halaman edukasi tentang jenis sampah
- PWA manifest untuk instalasi pada Android (butuh icon dan HTTPS or localhost)

Quick start:

1. Jalankan simple HTTP server di folder `dadada`:

```bash
# Python 3
python -m http.server 8000

# or using node
npx serve . -l 8000
```

2. Buka `http://localhost:8000` di Chrome (Android: buka di Chrome dan pilih "Install" atau "Add to Home screen")

Notes:
- Kamera di Android memerlukan HTTPS atau situs terinstall sebagai PWA dari origin yang aman. Menggunakan `localhost` saat pengembangan juga mengizinkan kamera.
- Untuk akurasi lebih baik, pertimbangkan melatih model khusus sampah atau menggunakan model deteksi objek.
