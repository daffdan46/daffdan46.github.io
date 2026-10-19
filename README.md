# Daf — Portfolio

Astro + GitHub Pages. Dark editorial, Playfair Display + DM Sans.

## Jalanin lokal
```bash
npm install
npm run dev        # http://localhost:4321
```

## Deploy ke GitHub Pages
1. Buat repo baru di GitHub, push isi folder ini ke branch `main`.
2. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Edit `astro.config.mjs`:
   - Repo `username.github.io` → `SITE = 'https://username.github.io'`, `BASE = '/'`
   - Repo lain, misal `portfolio` → `BASE = '/portfolio'`
4. Push. Workflow di `.github/workflows/deploy.yml` otomatis build dan deploy.

## Yang perlu lo isi
| File | Isi |
|---|---|
| `src/utils.ts` | Email dan link sosial |
| `src/pages/info.astro` | Bio final dan daftar client |
| `src/content/projects/*.md` | Satu file per project |
| `src/assets/projects/<slug>/` | Gambar project (ganti placeholder) |

## Nambah / edit project
Tiap project = 1 file Markdown di `src/content/projects/`.

```yaml
title: "Nama Project"
client: "Client"
role: "Visual Designer"
scope: ["Key visual", "Layout"]
year: "2025"
category: "Key visual"
order: 1            # urutan tampil
featured: true      # true = masuk parallax showcase di homepage
cover: "../../assets/projects/slug/cover.jpg"     # landscape, min 1600px
detail: "../../assets/projects/slug/detail.jpg"   # portrait 3:4, layer overlap
gallery:
  - { src: "../../assets/projects/slug/exec-1.jpg", alt: "...", size: "full" }  # full | half | tall
result: "Satu kalimat hasil akhir."
```
Body Markdown: pakai `## Situation`, `## Problem`, `## Approach` lalu satu paragraf pendek per section.

Gambar boleh .jpg/.png/.webp, Astro otomatis compress dan bikin versi responsive.

## Tuning motion
- Kecepatan parallax: atribut `data-speed` di `src/pages/index.astro` (negatif = gerak berlawanan).
- Smooth scroll: `lerp` di `src/scripts/main.ts` (lebih kecil = lebih "berat").
- Intro cuma muncul sekali per session. Buat ngetes ulang: buka di tab incognito.
- Semua motion otomatis mati kalau user aktifin reduce motion di OS.
