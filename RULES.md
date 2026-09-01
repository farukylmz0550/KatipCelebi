# Çalışma Kuralları

## Git Workflow

**Her mantıklı adım bitirildiğinde commit'leyip push'la.**

- Adım tanımı: tek bir sorumluluk (SRP) tamamlandığında (örn. bir modül, bir fix, bir e2e spec, bir config değişimi)
- Commit mesajı: kısa, Türkçe/İngilizce, conventional (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- Push: `git push origin main` her commit sonrası (yeni kural 2026-09-01)
- Hariç: `*.webm`, `node_modules`, `.next`, `prisma/dev.db` (zaten .gitignore)
- Kaynak: kullanıcı talimatı 2026-09-01

## İlgili Dosyalar

- `CLAUDE.md` ve `AGENTS.md` bu kurala referans verir
- `e2e/` testleri, `src/app/api/test/reset` gibi dev-only yardımcılar da bu kurala tabidir
