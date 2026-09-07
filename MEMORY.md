# KatipCelebi — Memory Bank

> Son güncelleme: 2026-09-08
> Versiyon: 2.2.0
> Branch: main

---

## 1. Proje Tanımı

Kişisel kütüphane yönetim uygulaması. Kitap ekleme, ödünç verme takibi, okuma istatistikleri ve Duolingo tarzı gamification (XP, seviye, başarımlar, liderlik tablosu).

Orijinal PyQt6 masaüstü uygulamasının web yeniden yazımı (`legacy` branch).

**Repo:** https://github.com/farukylmz0550/KatipCelebi

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts |
| Veritabanı | SQLite via Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials, JWT, bcrypt) |
| Doğrulama | Zod |
| Biçimlendirme | Prettier + ESLint |
| Test | Vitest (unit), Playwright (e2e) |
| i18n | Cookie tabanlı locale, 6 sözlük |
| Deploy | Docker, Docker Compose |

---

## 3. Dosya Yapısı

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── books/            # Kitap listesi, ekleme, içe aktarma, filtreler
│   │   │   │   └── [id]/         # Kitap detay, düzenleme, ödünç, kişisel
│   │   │   ├── lending/          # Ödünç listesi ve formu
│   │   │   ├── people/           # Kişi rehberi ve geçmişi
│   │   │   ├── stats/            # İstatistikler, hedefler, grafikler
│   │   │   ├── achievements/     # Başarım rozetleri
│   │   │   ├── leaderboard/      # XP sıralaması
│   │   │   ├── profile/          # İsim düzenleme, şifre değiştirme
│   │   │   └── admin/
│   │   │       ├── users/        # Kullanıcı yönetimi (onayla/reddet/sil)
│   │   │       └── covers/       # Cover önbellek yönetimi
│   │   ├── actions/              # Server actions (veri değişiklikleri)
│   │   ├── api/                  # API route'ları (auth, test reset)
│   │   ├── login/                # Giriş sayfası
│   │   ├── register/             # Kayıt sayfası
│   │   └── setup/                # İlk kurulum (admin hesabı)
│   ├── components/ui/            # shadcn/ui bileşenleri
│   ├── lib/
│   │   ├── books/                # Kitap alan mantığı + filtreler
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── gamification.ts       # XP, seviye, başarımlar (DB bağımlı)
│   │   ├── gamification-pure.ts  # Saf fonksiyonlar (DB yok, client-safe)
│   │   ├── goals.ts              # Hedef matematiği
│   │   ├── isbn.ts               # ISBN arama
│   │   ├── person.ts             # Kişi normalizasyonu, güven
│   │   ├── stats.ts              # Aylık bitiş sayıları
│   │   └── theme.ts              # Cookie tabanlı tema
│   ├── i18n/                     # Sözlükler (en, tr, es, fr, ru, zh)
│   ├── auth.ts                   # NextAuth yapılandırması + onay kontrolü
│   ├── proxy.ts                  # Proxy (auth + rate limiting)
│   └── types/                    # TypeScript bildirimleri
├── prisma/
│   ├── schema.prisma             # Veri modeli
│   ├── seed.ts                   # Başarım kataloğu tohumu (dev)
│   ├── seed.cjs                  # Başarım kataloğu tohumu (Docker)
│   └── migrations/               # Veritabanı migrasyonları
├── e2e/                          # Playwright E2E testleri
├── public/                       # Statik dosyalar (favicon, ikonlar)
├── Dockerfile                    # Çok katmanlı Docker build
├── docker-compose.yml            # Self-hosting kurulumu
└── vitest.config.ts              # Unit test yapılandırması
```

---

## 4. Veri Modeli

```
User ──────┬── Book ──────── LendingRecord
           ├── Person ────── LendingRecord
           ├── Goal
           └── UserAchievement ── Achievement
```

| Model | Ana Alanlar |
|-------|------------|
| **User** | email, passwordHash, name, isAdmin, approved, xp |
| **Book** | isbn, title, author, coverUrl, status, rating, tags, copies, 17 legacy alan |
| **Person** | name (kullanıcı başına benzersiz), ödünçte otomatik oluşturulur |
| **LendingRecord** | book, borrower, lentAt, returnedAt, denormalized bookTitle |
| **Goal** | kullanıcı başına yıllık/aylık hedefler |
| **Achievement** | key, titleKey, descriptionKey, iconKey (i18n) |
| **UserAchievement** | kullanıcı + başarım bağlantısı + kilidi açma tarihi |

---

## 5. Server Actions

| Dosya | Mutasyonlar |
|-------|------------|
| `auth.ts` | register (approved=false ayarlar) |
| `books.ts` | add, import, update, delete, set status |
| `lending.ts` | create, return |
| `people.ts` | create, remove |
| `goals.ts` | set yearly/monthly |
| `excel.ts` | export, template, import |
| `profile.ts` | update name, change password |
| `covers.ts` | clear cache (admin) |
| `admin.ts` | approve/reject users, toggle admin, delete users |
| `locale.ts` | switch language |
| `theme.ts` | toggle theme |

Her veri değişikliği yapan action `awardXp()` + `syncAchievements()` çalıştırır.

---

## 6. Ortam Değişkenleri

| Değişken | Gerekli | Varsayılan | Açıklama |
|----------|---------|------------|----------|
| `DATABASE_URL` | Evet | `file:./prisma/dev.db` | SQLite veritabanı yolu |
| `NEXTAUTH_SECRET` | Evet | — | JWT imzalama sırrı |
| `NEXTAUTH_URL` | Hayır | `http://localhost:3000` | Uygulama URL'i |
| `APP_PORT` | Hayır | `3000` | Port (Docker tarafından kullanılır) |
| `RESET_SECRET` | Hayır | — | `/api/test/reset` endpoint sırrı |
| `ALLOW_REGISTRATION` | Hayır | `true` | `false` yaparak herkese açık kaydı devre dışı bırak |

---

## 7. Docker Kurulumu

```bash
# Pre-built image
docker compose up -d

# Kaynaktan build
docker compose up -d --build
```

- Build tools (python3, make, g++) production stage'de de kurulu
- `seed.cjs` Docker'da tsx olmadan çalışır
- Prisma migrasyonları entrypoint tarafından otomatik çalıştırılır

---

## 8. Test

```bash
npm test              # 92 unit test (vitest)
npx playwright test   # 26 e2e test (playwright)
npm run lint          # eslint
npm run format:check  # prettier
```

---

## 9. Önemli Commit Özeti (Web Yeniden Yazımı)

| Tarih | Commit | Açıklama |
|-------|--------|----------|
| 2026-09-08 | `768d827` | GitHub Actions silindi, README güncellendi |
| 2026-09-08 | `62ca415` | Docker build + Turbopack uyumluluk + TS hataları düzeltildi |
| 2026-09-07 | `d08b72e` | i18n düzeltmeleri, CI/CD, admin onay sistemi |
| 2026-09-07 | `d294650` | showOnLeaderboard opt-out eklendi |
| 2026-09-07 | `92b4070` | Güvenlik: .env.example'dan tehlikeli NEXTAUTH_SECRET kaldırıldı |
| 2026-09-07 | `df14474` | Güvenlik: Security header'ları eklendi |
| 2026-09-07 | `fba642f` | Güvenlik: Koşullu seeding (entrypoint) |
| 2026-09-07 | `8f6a3e6` | Güvenlik: Cookie httpOnly/secure/sameSite |
| 2026-09-07 | `a95cb3e` | Güvenlik: Zod string uzunluk limitleri + coverUrl doğrulama |
| 2026-09-07 | `c76e074` | Güvenlik: lookupIsbnAction için auth zorunlu |
| 2026-09-07 | `0b16703` | Güvenlik: Admin kurulumu için Zod + transaction guard |
| 2026-09-07 | `2684f4b` | Güvenlik: ALLOW_REGISTRATION env var |
| 2026-09-07 | `a9dd777` | Güvenlik: Test reset admin + token ile korundu |
| 2026-09-04 | `3b530eb` | Docker build workflow (GHCR) eklendi |
| 2026-09-04 | `c44a25d` | README ve CONTRIBUTING.md yeniden yazıldı |
| 2026-09-04 | `282eef1` | Prettier eklendi |
| 2026-09-04 | `3ce6d8a` | Cover cache istatistik doğruluğu iyileştirildi |
| 2026-09-04 | `59d2d6f` | Dockerignore PNG sorunu düzeltildi |
| 2026-09-04 | `4d675a5` | Yetim Rust crate kaldırıldı |
| 2026-09-04 | `f314a85` | Kullanılmayan bileşenler ve ölü kod kaldırıldı |
| 2026-09-04 | `c2303bf` | Sabit veritabanı yolları taşınabilirlik için düzeltildi |
| 2026-09-02 | `9d85a8a` | PWA/TWA desteği + bildirimler |
| 2026-09-02 | `a5f0c2c` | GNOME Adwaita tasarım dili |
| 2026-09-02 | `a35f651` | Editöryel yeniden tasarım — AI şablon hissi kaldırıldı |
| 2026-09-01 | `f127944` | Sıcak & Edebi UI yeniden tasarımı + shadcn/ui |
| 2026-09-01 | `e247fe7` | Favicon, hata/yükleme durumları, profil sayfası, sayfalama, SEO, rate limiting, unit testler |
| 2026-08-31 | `cce9700` | Playwright e2e test paketi + vitest exclude |
| 2026-08-31 | `6e88849` | SQLite + rust core + legacy eşdeğer (kitaplar, kişiler, hedefler, excel, openlibrary, i18n) |

---

## 10. Bilinen Sorunlar ve Notlar

- **Turbopack + better-sqlite3:** Turbopack client component'leribetter-sqlite3'ü bundle eder → `fs` hatası. Çözüm: `gamification-pure.ts` ile saf fonksiyonlar ayrıldı.
- **Docker production stage:** better-sqlite3 node-gyp ile derlenir, production stage'de python3/make/g++ gerekir.
- **prisma7.config.ts:** `dotenv/config` devDependency olarak production'da mevcut değil → kaldırıldı, env var doğrudan kullanılır.
- **seed.cjs:** TypeScript tohum dosyası (`tsx` devDependency) production'da çalışmaz → plain JS alternatif eklendi.
- **Proxy (middleware.ts):** Next.js 16'da `middleware.ts` deprecated → `proxy.ts` doğru convention.

---

## 11. Orijinal Proje (Legacy)

Masaüstü uygulaması PyQt6 ile yazılmıştır. `legacy` branch'inde bulunur.
GPLv3 lisansı altında her iki proje de devam eder.

---

*Bu dosya AI asistanları için proje bağlamı sağlar. Düzenli olarak güncellenmelidir.*
