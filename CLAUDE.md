# Ekip Görev — proje talimatları

Bu depo [usekaneo/kaneo](https://github.com/usekaneo/kaneo) projesinin bir fork'udur. Upstream'in ayrıntılı geliştirme rehberi `AGENTS.md` dosyasındadır ve aşağıda içe aktarılır. Bu dosyadaki kurallar ve kullanıcının isteği önceliklidir.

@AGENTS.md

## Proje amacı

Kaneo'yu küçük bir ekibin (3-8 kişi) haftalık ve aylık görevlerini planladığı, görev paylaştığı ve beyin fırtınası yaptığı sade bir uygulamaya dönüştürmek.

## Çalışma kuralları

- Değişiklikleri küçük adımlarla yap; her adımdan sonra uygulamanın çalıştığını doğrula (en azından API `/api/health`, web arayüzü ve ilgili testler).
- Mevcut kod stilini ve klasör yapısını koru. Yeni bağımlılık eklemeden önce kullanıcıya sor.
- Veritabanı değişikliklerini migration ile yap: şemayı `apps/api/src/database/schema.ts` dosyasında değiştir, `pnpm --filter @kaneo/api db:generate` ile migration üret (`apps/api/drizzle/`), oluşan SQL'i incele. Veritabanında elle şema değiştirme.
- Kaneo'nun `LICENSE` dosyasını (MIT, © Andrej Acevski) ve telif notlarını silme ya da değiştirme.
- Arayüze dokunan her işte [DESIGN.md](DESIGN.md)'ye uy ve `emil-design-eng` skill'ini kullan. Animasyon eklerken `animate`, birden fazla öğe birlikte hareket ederken `choreograph` skill'ini kullan.

## Mimari özet

pnpm monorepo; görevler Vite+ (`vp`) ile çalışır (`pnpm-workspace.yaml`, kök `vite.config.ts`).

| Yol | İçerik |
|---|---|
| `apps/api` | Hono + `@hono/zod-openapi` REST API, WebSocket, zamanlayıcı, entegrasyonlar. Drizzle ORM + PostgreSQL. Kimlik doğrulama: better-auth (e-posta/şifre, e-posta kodu, magic link, GitHub ve genel OAuth/OIDC, misafir, API anahtarı). |
| `apps/web` | Ana web uygulaması: React 19 + TanStack Router/Query, Vite+, Tailwind CSS v4, shadcn tarzı bileşenler (`src/components/ui`, Base UI + Radix), lucide ikonları, Tiptap editör, dnd-kit, zustand. |
| `apps/mobile` | Expo / React Native uygulaması (kendi HTTP istemcisi var). |
| `apps/site`, `apps/docs` | Tanıtım sitesi (Next.js) ve dokümantasyon (Mintlify). Ekip uygulaması için gerekli değil. |
| `packages/libs` | Tipli Hono istemcisi ve URL yardımcıları (web bunu kullanır). |
| `packages/permissions` | Rol/yetki sözlüğü: çalışma alanı rolleri `viewer`, `member`, `admin`, `owner`; sunucu rolleri `admin`, `user`. |
| `packages/editor`, `packages/email` | Paylaşılan Tiptap eklentileri; React Email e-posta şablonları. |
| `packages/cli`, `packages/mcp`, `packages/importers`, `packages/planka-import` | Komut satırı aracı, MCP sunucusu, Trello/Jira/Linear/Plane/PLANKA içe aktarıcıları. |
| `i18n/` | Çeviri dosyaları (i18next). Kaynak `en-US.json`; `tr-TR.json` dahil 22 dil var. |
| `tests/` | `api` (birim), `api-integration` (gerçek PostgreSQL), `e2e` (Playwright + Docker). |

### Veri modeli (özet)

- **Kullanıcı ↔ Çalışma alanı:** `user` ↔ `workspace` çoka çok, rol bilgisiyle `workspace_member` üzerinden. Çalışma alanı, better-auth "organization" eklentisine karşılık gelir. Ayrıca `team` / `team_member`, `invitation` ve özel roller (`workspace_role`) var.
- **Çalışma alanı → Proje:** `project.workspace_id`. Üye bazlı proje erişimi `workspace_member_access` (`all` ya da seçili projeler) ve `workspace_member_project` ile yönetilir.
- **Proje → Sütun → Görev:** `column` (pano sütunu; `is_final` "bitti" sütununu işaretler), `task.project_id`, `task.column_id`. Görevde tek atanan kişi var (`task.assignee_id`).
- **Görev alanları:** `title`, `description` (Markdown), `status`, `priority`, `position`, `number`, **`start_date`**, **`due_date`**, `recurrence` (jsonb: daily/weekly/monthly/yearly, aralık, hafta günleri, saat dilimi).
- **Göreve bağlı tablolar:** `comment`, `label`, `time_entry`, `activity`, `task_relation` (`subtask`/`blocks`/`related`), `custom_field_value`, `asset`, `external_link`, `notification`.
- **Mevcut görünümler:** pano (board), backlog, takvim, Gantt, "Görevlerim" (`my-tasks`), gelen kutusu (inbox), arama, Fikir Tahtası (`whiteboard`), Notlar (`notes`).
- **Fikir Tahtası:** projeye bir Excalidraw tahtası (`project_board`: `scene` jsonb, `version`, `updated_by`). API `GET/PUT /api/project-board/{projectId}`; son kaydeden kazanır, yanıt kimin değişikliğinin üzerine yazıldığını söyler; kayıt `PROJECT_BOARD_UPDATED` WebSocket mesajı üretir. Web kodu `apps/web/src/components/whiteboard/`, çizim fontları `apps/web/vite-plugins/excalidraw-fonts.ts` ile uygulamadan sunulur. Göreve dönüştürülen öğe `customData.kaneoTaskId` ve görev bağlantısı taşır.
- **Notlar:** projede birden fazla not (`project_note`: `title`, `content` jsonb = BlockNote blokları, `version`, `created_by`, `updated_by`). API `/api/project-note` (liste içeriksiz döner; kaydetme Fikir Tahtası'yla aynı "son kaydeden kazanır" kuralı; `PROJECT_NOTES_UPDATED`). Web kodu `apps/web/src/components/notes/`; editör `@blocknote/shadcn` ile ve yalnızca not açılınca yüklenir. Görseller S3 gerektirmesin diye küçültülüp nota gömülür. Otomatik kayıt (`components/common/autosave/`) ve "Göreve dönüştür" (`components/shared/convert-to-task/`) iki özellikte ortaktır. Görev açıklamaları henüz Tiptap'ta; BlockNote'a geçiş özel bloklar ve tüm açıklamalar için dönüşüm testi gerektirir.

### Değişikliği uçtan uca takip et

API rotası/şeması → `@kaneo/libs` istemcisi → `apps/web/src/fetchers` ve TanStack Query hook'ları → gerçek zamanlı güncelleme (`publishEvent`) → i18n anahtarları (`i18n/en-US.json` ve `tr-TR.json`) → gerekirse `pnpm openapi:check:fix`.

## Yerelde çalıştırma

Gereksinimler: Node.js 24.15+ (veya 26+), pnpm 12.15+, PostgreSQL 16. Redis ve S3 isteğe bağlıdır.

1. Bir PostgreSQL veritabanı oluştur (ör. kullanıcı `kaneo`, veritabanı `kaneo`). Docker varsa `compose.local.yml` içindeki `postgres` servisi kullanılabilir (`.env.local` ister).
2. Kökte `.env` oluştur (git'e girmez). En az şunlar gerekir:
   ```
   KANEO_CLIENT_URL=http://localhost:5173
   KANEO_API_URL=http://localhost:1337
   DATABASE_URL=postgresql://kaneo:SIFRE@localhost:5432/kaneo
   AUTH_SECRET=<openssl rand -hex 32 çıktısı>
   ```
   Diğer değişkenler için `.env.sample` dosyasına bak. SMTP ayarlanmazsa e-posta ve şifre ile giriş kullanılır.
3. `pnpm install`
4. Paketleri derle, ardından yalnızca API ve web'i ayrı terminallerde başlat:
   ```
   pnpm build:dependencies
   pnpm --filter @kaneo/api dev
   pnpm --filter @kaneo/web dev
   ```
   `pnpm dev` site, docs ve e-posta önizlemesini de başlatır; bunlardan biri çıkış yaparsa hepsi durur.
5. API açılışta migration'ları otomatik uygular. Kontrol: `curl http://localhost:1337/api/health` ve tarayıcıda http://localhost:5173. İlk kaydolan hesap sunucu yöneticisi olur.

## Test ve lint

| Komut | Ne yapar |
|---|---|
| `pnpm lint` | Vite+ biçim ve lint kontrolü (dosya değiştirmez). Düzeltme için `pnpm exec vp check --fix`. |
| `pnpm typecheck` | Paketlerin TypeScript kontrolü. |
| `pnpm test` | Tüm birim testleri (Vitest). Tek paket: `pnpm exec vp run --filter @kaneo/api test`. |
| `pnpm test:integration` | API entegrasyon testleri. `DATABASE_URL` içindeki veritabanı adının sonuna `_test` eklenmiş veritabanını kullanır (ör. `kaneo_test`); önceden oluşturulmalı. |
| `pnpm i18n:check` | Çeviri dosyalarının `en-US.json` ile senkron olduğunu kontrol eder. |
| `pnpm openapi:check` | `apps/docs/openapi.json` dosyasının güncel olduğunu kontrol eder. |
| `pnpm test:e2e` | Playwright testleri (`tests/e2e`, Docker ister). |

CI sırası: `pnpm lint` → `pnpm i18n:check` → `pnpm openapi:check` → `pnpm typecheck` → `pnpm test` → entegrasyon testleri.

Süreler (4 çekirdekli bulut ortamında): `pnpm lint` birkaç saniye, `pnpm test` yaklaşık 9 dakika, entegrasyon testleri yaklaşık 17 dakika. Günlük işlerde değişen paketin testini ve ilgili entegrasyon dosyasını çalıştır, ör. `pnpm --filter @kaneo/api exec vp test run --config vitest.integration.config.ts ../../tests/api-integration/task.test.ts`.
