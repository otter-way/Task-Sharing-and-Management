# Ekip Görev

Küçük ekiplerin (3–8 kişi) haftalık ve aylık işlerini birlikte planladığı, görevleri paylaştığı ve beyin fırtınası yaptığı, kendi sunucunuzda çalışan sade bir görev yönetimi uygulaması.

> **Kaneo üzerine kurulmuştur.** Bu depo, Andrej Acevski'nin geliştirdiği açık kaynak proje yöneticisi [Kaneo](https://github.com/usekaneo/kaneo)'nun bir fork'udur ve onun [MIT lisansı](LICENSE) ile dağıtılır. Kaneo'nun lisans dosyası ve telif notu değiştirilmeden korunmuştur.

## Amaç

Kaneo hızlı ve sade bir proje yöneticisi. Ekip Görev onu bir adım daha sadeleştirip küçük bir ekibin günlük ritmine odaklıyor:

- Haftanın işlerini tek bakışta görmek ve gerektiğinde günden güne taşımak,
- Ayın genel planını çıkarmak,
- Fikirleri bir tahtada toplayıp uygun olanları doğrudan göreve dönüştürmek,
- Toplantı notlarını ve planları projenin içinde tutmak.

Arayüz varsayılan olarak Türkçedir; ayarlardan 22 dilden biri seçilebilir.

## Özellikler

### Takvim: Hafta ve Ay görünümü

- **Hafta:** Pazartesi'den Pazar'a, her görev bitiş gününde tek satır. Günlerde görev sayısı, "Bu hafta" ile bugüne dönüş ve "Sadece benim görevlerim" filtresi.
- **Ay:** Birden fazla güne yayılan görevler çubuk olarak; kalabalık günlerde "+N daha" listesi.
- **Sürükle-bırak ile yeniden planlama:** Bir görevi başka bir güne sürüklemek bitiş tarihini değiştirir; saat ve görevin süresi korunur. Tarihsiz görevler sağdaki **Tarihsiz** listesinden bir güne bırakılarak planlanır, ters yönde bırakmak tarihleri temizler. Klavyede odaklı görev `Alt + ←/→` ile bir gün kaydırılır.
- Kaydetme başarısız olursa değişiklik geri alınır ve bildirim gösterilir. Hareketi azaltma tercihi (`prefers-reduced-motion`) olan kullanıcılarda yalnızca yumuşak geçişler kalır.

### Fikir Tahtası

- Her projede ortak bir [Excalidraw](https://github.com/excalidraw/excalidraw) tahtası; çizimler otomatik kaydedilir.
- Bir metni ya da yapışkan notu seçip **Göreve dönüştür** ile görev oluşturulur; tahtadaki öğe göreve bağlantı taşır.
- Tahta PNG olarak dışa aktarılabilir. Aynı anda düzenleyen ekip arkadaşları için kural "son kaydeden kazanır"dır ve kimin değişikliğinin üzerine yazıldığı bildirilir.

### Notlar

- Projede birden fazla not; [BlockNote](https://github.com/TypeCellOS/BlockNote) ile blok tabanlı editör. Editör yalnızca not açılınca yüklenir.
- Boş not, **Haftalık Toplantı** ve **Beyin Fırtınası Özeti** şablonları.
- Otomatik kayıt; nottaki bir yapılacaklar maddesini **Göreve dönüştür**. Görseller ek depolama (S3) gerektirmesin diye küçültülüp nota gömülür.

### Kaneo'dan gelenler

Pano, liste, bekleyenler ve Gantt görünümleri; "Görevlerim", gelen kutusu ve arama; alt görevler, etiketler, yorumlar, zaman takibi; çalışma alanı rolleri ve davetler; gerçek zamanlı güncellemeler (WebSocket); REST API, komut satırı aracı ve MCP sunucusu. Ayrıntılar için [Kaneo dokümantasyonu](https://kaneo.app/docs).

## Kurulum ve çalıştırma

### Gereksinimler

- Node.js 24.15+ (veya 26+)
- pnpm 12.15+
- PostgreSQL 16
- Redis ve S3 isteğe bağlıdır; tek sunucuda ikisi de gerekmez.

### Adımlar

1. **Veritabanını oluşturun** (örneğin kullanıcı `kaneo`, veritabanı `kaneo`). Docker kullanıyorsanız `compose.local.yml` içindeki `postgres` servisi işinizi görür; bu servis ayarlarını `.env.local` dosyasından okur.

2. **Kök dizinde `.env` dosyası oluşturun.** Bu dosya git'e eklenmez. En az şu değerler gerekir:

   ```
   KANEO_CLIENT_URL=http://localhost:5173
   KANEO_API_URL=http://localhost:1337
   DATABASE_URL=postgresql://kaneo:SIFRENIZ@localhost:5432/kaneo
   AUTH_SECRET=<openssl rand -hex 32 çıktısı>
   ```

   Diğer seçenekler için [`.env.sample`](.env.sample) dosyasına bakın. E-posta (SMTP) ayarlanmazsa giriş e-posta ve şifre ile yapılır.

3. **Bağımlılıkları kurun:**

   ```bash
   pnpm install
   ```

4. **Paylaşılan paketleri derleyin:**

   ```bash
   pnpm build:dependencies
   ```

5. **API'yi ve web arayüzünü ayrı terminallerde başlatın:**

   ```bash
   pnpm --filter @kaneo/api dev
   ```

   ```bash
   pnpm --filter @kaneo/web dev
   ```

   API açılışta veritabanı migration'larını kendisi uygular.

6. **Kontrol edin:** `http://localhost:1337/api/health` adresi `{"status":"ok"}` döndürmeli; uygulama `http://localhost:5173` adresinde açılır. İlk kaydolan hesap sunucu yöneticisi olur.

Sunucuya kurulum (Docker imajı, Helm) için Kaneo'nun [kurulum rehberi](https://kaneo.app/docs/core/installation) geçerlidir.

### Test ve kontrol

| Komut | Ne yapar |
| --- | --- |
| `pnpm lint` | Biçim ve lint kontrolü (dosya değiştirmez). |
| `pnpm typecheck` | TypeScript kontrolü. |
| `pnpm test` | Birim testleri (Vitest). |
| `pnpm test:integration` | API entegrasyon testleri; adı `_test` ile biten ayrı bir veritabanı ister (ör. `kaneo_test`). |
| `pnpm i18n:check` | Çeviri dosyalarının `en-US.json` ile uyumunu kontrol eder. |
| `pnpm test:e2e` | Tarayıcı testleri (Playwright); ayrıntılar [tests/e2e/README.md](tests/e2e/README.md) dosyasında. |

Geliştirme kuralları ve mimari özet için [CLAUDE.md](CLAUDE.md), arayüz ilkeleri için [DESIGN.md](DESIGN.md) dosyasına bakın.

## Teşekkür ve lisanslar

Ekip Görev, aşağıdaki açık kaynak projelerin emeği üzerine kuruludur. Hepsine teşekkür ederiz.

| Proje | Kullanım | Lisans |
| --- | --- | --- |
| [Kaneo](https://github.com/usekaneo/kaneo) — Andrej Acevski ve katkıda bulunanlar | Uygulamanın temeli | MIT ([LICENSE](LICENSE), © 2024 Andrej Acevski) |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | Fikir Tahtası çizim alanı (`@excalidraw/excalidraw`) | MIT |
| [BlockNote](https://github.com/TypeCellOS/BlockNote) | Notlar editörü (`@blocknote/core`, `@blocknote/react`, `@blocknote/shadcn`) | MPL-2.0 |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) — Emil Kowalski | Animasyon ve arayüz tasarımı için geliştirme rehberleri (`.claude/skills`, `.agents/skills`) | MIT |

BlockNote paketleri değiştirilmeden npm bağımlılığı olarak kullanılır. MPL-2.0 dosya bazlı bir lisanstır: BlockNote'un kendi dosyalarında değişiklik yaparak dağıtırsanız o dosyaların kaynak kodunu da paylaşmanız gerekir; bu depodaki kodu etkilemez.

Kaneo'yu beğendiyseniz geliştiricisini [GitHub Sponsors](https://github.com/sponsors/andrejsshell) üzerinden destekleyebilirsiniz.

## Lisans

MIT. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
