# KatipCelebi — Memory Bank

> Son güncelleme: 2026-09-09
> Versiyon: 2.3.0
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
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts, Noto Serif/Sans/Mono |
| Tema | Terracotta × Dusty Rose (light) / Ink & Copper (dark) — CSS vars `UI_Design_Language.md` |
| Veritabanı | SQLite via Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials, JWT, bcrypt) |
| Doğrulama | Zod |
| Biçimlendirme | Prettier + ESLint |
| Test | Vitest (unit), Playwright (e2e) |
| i18n | Cookie tabanlı locale, 6 sözlük |
| PWA | `public/sw.js` + `manifest.json` + `src/app/sw-register.tsx` |
| Consent | GDPR cookie banner `src/components/cookie-consent.tsx` (Essential/Preferences/Analytics) |
| Deploy | Docker (multi-stage), Docker Compose, GHCR |

---

## 3. Dosya Yapısı

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── books/            # Kitap listesi (Card/List), ekleme (ISBN tek tık + detaylı), filtreler, Excel
│   │   │   │   ├── books-add-section.tsx  # Ok → detaylı form (60/40 kart)
│   │   │   │   ├── book-card.tsx          # Eşit kart h-[380px] 60/40 object-contain
│   │   │   │   ├── books-grid.tsx         # 2→3→4 cols + view-mode cookie
│   │   │   │   └── [id]/                  # Kitap detay, düzenleme, ödünç, kişisel
│   │   │   ├── lending/          # Ödünç listesi ve formu
│   │   │   ├── people/           # Kişi rehberi ve geçmişi
│   │   │   ├── stats/            # İstatistikler, hedefler, grafikler, streak, heatmap
│   │   │   ├── achievements/     # Başarım rozetleri (grid)
│   │   │   ├── leaderboard/      # XP sıralaması
│   │   │   ├── profile/          # İsim düzenleme, şifre değiştirme
│   │   │   ├── settings/         # Bildirim + tema (Sun/Moon SVG)
│   │   │   ├── more/             # Bottom-nav overflow
│   │   │   └── admin/            # Admin (users, covers) — sidebar en altta
│   │   ├── actions/              # Server actions (books, lending, people, goals, excel, profile, covers, admin, locale, theme, logout, settings)
│   │   ├── api/                  # API route'ları (auth, test reset, streak, well-known)
│   │   ├── login/                # Giriş sayfası
│   │   ├── register/             # Kayıt sayfası
│   │   └── setup/                # İlk kurulum (admin hesabı)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (token-aware)
│   │   ├── sidebar.tsx           # Collapsible sidebar (desktop, cookie sidebar-collapsed)
│   │   ├── bottom-nav.tsx        # Bottom nav (mobile, safe-area)
│   │   ├── cookie-consent.tsx    # GDPR banner (desktop modal / mobile bar)
│   │   ├── theme-dropdown.tsx    # Sun/Moon SVG (Lucide ISC)
│   │   └── install-prompt.tsx    # PWA install
│   ├── lib/
│   │   ├── books/                # Kitap alan mantığı + filters + openlibrary
│   │   ├── cookies.ts / cookies-client.ts / cookies-shared.ts # Consent helpers
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── gamification.ts       # XP, seviye, başarımlar (DB)
│   │   ├── gamification-pure.ts  # Saf fonksiyonlar (Fibonacci, streak)
│   │   ├── goals.ts              # Hedef matematiği
│   │   ├── isbn.ts               # ISBN arama (full metadata)
│   │   ├── person.ts             # Kişi normalizasyonu, güven
│   │   ├── stats.ts              # Aylık bitiş sayıları
│   │   ├── streak.ts             # Streak hesaplama
│   │   └── theme.ts              # Cookie tema (light/dark, Sun/Moon)
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
├── public/                       # Statik dosyalar, sw.js, manifest.json
├── UI_Design_Language.md         # Visual language source of truth
├── Architecture_Principles.md    # Architectural boundaries
├── Project_Rules.md              # Project-level rules
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
| **User** | email, passwordHash, name, isAdmin, approved, xp, currentStreak, longestStreak, lastActiveDate, streakShieldCount |
| **Book** | isbn, title, author, coverUrl, status, rating, tags, copies, subtitle, publishers, publishDate, publishPlaces, numberOfPages, languages, isbn10/13, subjects, 17 legacy alan |
| **Person** | name (kullanıcı başına benzersiz), ödünçte otomatik oluşturulur |
| **LendingRecord** | book, borrower, lentAt, returnedAt, denormalized bookTitle, personId |
| **Goal** | kullanıcı başına yıllık/aylık hedefler |
| **Achievement** | key, titleKey, descriptionKey, iconKey (i18n) — 8 adet (week/month/century streak dahil) |
| **UserAchievement** | kullanıcı + başarım bağlantısı + kilidi açma tarihi |
| **DailyActivity / StreakShield / UserSettings / PushSubscription** | streak & bildirim takibi |

---

## 5. Server Actions

| Dosya | Mutasyonlar |
|-------|------------|
| `auth.ts` | register (approved=false) |
| `books.ts` | add (full metadata, one-click ISBN), update, delete, set status, lookupIsbn |
| `lending.ts` | create, return |
| `people.ts` | create, remove |
| `goals.ts` | set yearly/monthly |
| `excel.ts` | export, template, import |
| `profile.ts` | update name, change password |
| `covers.ts` | clear cache (admin) |
| `admin.ts` | approve/reject users, toggle admin, delete users |
| `locale.ts` | switch language (consent-gated) |
| `theme.ts` | toggle theme Sun/Moon SVG (light/dark, consent-gated) |
| `logout.ts` | signOut |
| `settings.ts` | update notifications/streak/weeklyDigest |
| `cookies.ts` | setConsentCookie, hasConsent |

Her veri değişikliği yapan action `awardXp()` + `syncAchievements()` çalıştırır. ISBN tek tıkla eklemede `lookupIsbnAction` → `addBook` zinciri, tüm Open Library alanları kaydedilir.

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
| 2026-09-09 | `2.3.0` | UI Design Language 60/40 kart, Noto, Terracotta/Ink-Copper, collapsible sidebar, cookie consent (C), ISBN tek tık + detaylı form, bulk import kaldırıldı, high-contrast kaldırıldı, Sun/Moon SVG |
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
- **seed.cjs:** TypeScript tohum dosyası (`tsx` devDependency) production'da çalışmaz → plain JS alternatif eklendi (`CONTRIBUTING.md` istisna: `public/sw.js` + `prisma/seed.cjs`).
- **Proxy (middleware.ts):** Next.js 16'da `middleware.ts` deprecated → `proxy.ts` doğru convention.
- **Sidebar server actions:** Client Component içinde `setLocale.bind`/`setTheme.bind` → React #441 hatası. Çözüm: `useTransition` + doğrudan `setLocale()`/`setTheme()` çağrısı, `logoutAction` ayrı server action.
- **High Contrast:** `UI_Design_Language.md` ile uyumsuz olduğu için kaldırıldı (GNOME kalıntısı). Tema sadece `light`/`dark` (Sun/Moon SVG, Lucide ISC).
- **Book Card 60/40:** `h-[380px]` `h-[60%]` cover `object-contain p-2` + `h-[40%]` metadata `gap-1 px-3 py-3`, `text-[15px] serif` okunabilir. Bulk import (`importBooksByIsbn`) kaldırıldı.
- **Cookie Consent:** `src/lib/cookies-shared.ts` ile server/client ayrımı; `next/headers` sadece server'da.

---

## 11. Orijinal Proje (Legacy)

Masaüstü uygulaması PyQt6 ile yazılmıştır. `legacy` branch'inde bulunur.
GPLv3 lisansı altında her iki proje de devam eder.

---

## 12. Mobil Uygulama İçin Yapılacaklar (PWA İyileştirmeleri)

### Yüksek Öncelik
- [ ] **Kamera ile ISBN barkod tarama** — `html5-qrcode` ile telefon kamerasından barkod okuma
- [x] **Safe area insets** — `env(safe-area-inset-*)` + `safe-bottom`/`safe-top` (layout, bottom-nav)
- [x] **viewport-fit=cover** — `layout.tsx:27` `viewportFit: "cover"`
- [x] **Alt navigasyon barı** — `src/components/bottom-nav.tsx` + `src/components/sidebar.tsx` (Responsive Hybrid Shell)

### Orta Öncelik
- [ ] **Offline precaching** — App shell'i (HTML/CSS/JS) SW install'ta önceden cache'le
- [ ] **Offline fallback sayfası** — İnternet yokken boş sayfa yerine bilgilendirme sayfası
- [ ] **Web Share API** — Kitap detayını WhatsApp/e-posta ile paylaş
- [ ] **True push notification** — Sunucudan gerçek push (şu an sadece timer tabanlı)
- [ ] **SW güncelleme bildirimi** — Yeni versiyon geldiğinde toast göster
- [ ] **Özel kurulum butonu** — `BeforeInstallPrompt` API ile özel "Yükle" butonu

### Düşük Öncelik
- [ ] **Background sync** — Çevrimdışı form gönderimi, online olunca senkronize
- [ ] **Manifest shortcuts** — Ana ekrandan hızlı erişim (kitap ekle, ödünçler)
- [ ] **Manifest screenshots** — Zengin kurulum banner'ı için ekran görüntüleri
- [ ] **Touch gesture'lar** — Swipe, long-press (kitap durumu değiştirme vb.)
- [ ] **Haptic feedback** — Titreşim bildirimleri (Vibration API)

---

*Bu dosya AI asistanları için proje bağlamı sağlar. Düzenli olarak güncellenmelidir.*
