# Tasarım Kuralları

Bu belge, Ekip Görev arayüzünün görsel ve etkileşim kurallarını tanımlar. Değerler mevcut Kaneo token'larından türetilmiştir (`apps/web/src/index.css`, `apps/web/src/components/ui/`). Yeni bir değer icat etmeden önce burada ve token'larda karşılığını ara.

Kaynaklar: Emil Kowalski'nin tasarım mühendisliği ilkeleri (`emil-design-eng` skill'i) ve [`docs/design/ui-cheatsheet.md`](docs/design/ui-cheatsheet.md), [`docs/design/performance-cheatsheet.md`](docs/design/performance-cheatsheet.md).

## 1. Tasarım ilkesi

**Sade, sakin, odaklı.** Bu uygulama 3-8 kişilik bir ekibin her gün açtığı bir çalışma aracıdır; vitrin değildir.

- İçerik öne çıkar, arayüz geri çekilir. Renk, gölge ve hareket yalnızca bir şeyi açıklamak için kullanılır.
- Gereksiz süs yok: dekoratif gradyan, parıltı, büyük gölge, sürekli hareket eden öğe, kutlama efekti eklenmez.
- Gereksiz animasyon yok: bir animasyon "neden hareket ediyor?" sorusuna net bir cevap veremiyorsa kaldırılır.
- Hız bir tasarım özelliğidir. Arayüz kullanıcının hareketine anında cevap vermelidir; beklemek zorunda bırakan hiçbir geçiş olmaz.
- Görünmeyen ayrıntılar birikir: doğru köken noktası, doğru easing, tutarlı odak halkası. Kullanıcı tek tek fark etmez ama bütünü hisseder.

## 2. Teknik temel

Kütüphane değiştirilmez; her şey mevcut sistemin üzerine kurulur.

| Katman | Kullanılan | Not |
|---|---|---|
| Bileşenler | `apps/web/src/components/ui/` — shadcn tarzı, Base UI (`@base-ui/react`) temelli; bazı yerlerde Radix | Yeni bileşen yazmadan önce buradakini kullan veya genişlet. coss bileşen kalıplarına uyar (`coss` skill'i). |
| Stil | Tailwind CSS v4, `@theme inline` ile CSS değişkenleri | Ham renk (`#hex`) yazma; token kullan. |
| Varyantlar | `class-variance-authority` (`cva`), `cn()` (`@/lib/cn`) | Yeni görünüm = yeni varyant, bileşen kopyası değil. |
| İkonlar | `lucide-react` | Varsayılan boyut 16px (`size-4`), mobilde 18px. |
| Hareket | CSS geçişleri + Base UI `data-starting-style`/`data-ending-style`; liste/pano için `motion` (v14) | Önce CSS; JS yalnızca sürükleme ve dinamik listeler için. |
| Tema | `.dark` sınıfı ile açık/koyu | Her yeni token iki temada da tanımlanır. |

## 3. Renk

Palet nötr gri tabanlıdır; renk yalnızca **anlam** taşır (durum, öncelik, uyarı). Marka rengi yoktur: birincil eylem açık temada koyu gri, koyu temada açık gridir.

### Yüzeyler ve metin

| Token (Tailwind sınıfı) | Açık tema | Koyu tema | Kullanım |
|---|---|---|---|
| `background` | beyaz | neutral-950 (%96) | Sayfa zemini |
| `foreground` | neutral-800 | neutral-100 | Ana metin |
| `muted-foreground` | neutral-500 (koyulaştırılmış) | neutral-500 (açılmış) | İkincil metin, açıklama, zaman damgası |
| `card`, `popover` | beyaz | zeminden %2 açık | Kart, menü, açılır pencere |
| `sidebar` | neutral-50 | neutral-950 (%97) | Kenar çubuğu |
| `primary` / `primary-foreground` | neutral-800 / neutral-50 | neutral-100 / neutral-800 | Birincil buton |
| `accent`, `muted`, `secondary` | siyah %4 | beyaz %4 | Hover zemini, ikincil buton, sakin vurgu |
| `border` | siyah %8 | beyaz %6 | Kenarlıklar (varsayılan) |
| `input` | siyah %10 | beyaz %8 | Form alanı kenarı |
| `ring` | neutral-400 | neutral-500 | Odak halkası |

### Anlamsal renkler

| Token | Renk | Kullanım |
|---|---|---|
| `destructive` | red-500 | Silme, geri alınamaz eylem, hata |
| `success` | emerald-500 | Tamamlandı, başarılı kayıt |
| `warning` | amber-500 | Dikkat gerektiren durum |
| `info` | blue-500 | Bilgilendirme |
| `priority-low/medium/high/urgent` | mavi / amber / turuncu / kırmızı | Yalnızca görev önceliği |
| `due-overdue` | kırmızı | Yalnızca geciken bitiş tarihi |

Pano için ayrıca `board-*`, `chip-*`, `avatar-*` token'ları vardır; pano kartı ve etiket çiplerinde bunları kullan.

### Renk kuralları

- Renk tek başına bilgi taşımaz: öncelik ve durum her zaman ikon veya metinle birlikte gösterilir.
- Saydamlık için Tailwind oran sözdizimini kullan (`bg-destructive/8`, `border-success/24`); yeni hex renk ekleme.
- Bir ekranda aynı anda en fazla bir vurgu rengi baskın olur. Anlamsal renkler zemin olarak düşük oranda (%4-16) kullanılır.
- Metin kontrastı WCAG AA'yı (4.5:1) karşılamalı; `muted-foreground` yalnızca ikincil bilgi içindir.

## 4. Tipografi

- **Yazı tipleri:** `font-sans` = Geist Variable, `font-mono` = Geist Mono Variable (görev numarası, kod, sayılar). Başka yazı tipi eklenmez.
- **Gövde boyutu:** masaüstünde `text-sm` (14px), mobilde `text-base` (16px; iOS'ta yakınlaştırmayı önler). Bileşenlerdeki `text-base sm:text-sm` kalıbını koru.

| Rol | Sınıf | Ağırlık |
|---|---|---|
| Sayfa başlığı | `text-2xl` – `text-3xl` | `font-semibold tracking-tight` |
| Bölüm başlığı | `text-lg` – `text-xl` | `font-semibold tracking-tight` |
| Gövde, form, buton | `text-sm` (mobilde `text-base`) | `font-normal` / butonda `font-medium` |
| Meta bilgi, etiket, rozet | `text-xs` | `font-medium` |

- **Ağırlıklar:** `font-medium` (varsayılan vurgu) ve `font-semibold` (başlık). `font-bold` kullanılmaz.
- Başlıklar `tracking-tight` alır (temel stilde tanımlı); büyük başlıklarda `-0.02em`'e kadar sıkılaştırılabilir.
- Değişen sayılar (sayaç, süre, tarih, yüzde) `tabular-nums` kullanır; titreme olmaz.
- Uzun metin satırı en fazla ~65 karakter (`max-w-[65ch]`).
- Tarihler: bir haftadan eski göreli zaman ("340 gün önce") yerine mutlak tarih göster.
- Sayı + isim çiftleri `Intl.PluralRules` / i18next çoğul anahtarlarıyla yazılır ("1 üye", "3 üye").
- Kullanıcıya görünen her metin `i18n/en-US.json` + `i18n/tr-TR.json` anahtarlarından gelir.

## 5. Boşluk ve yerleşim

Tailwind'in 4px tabanlı ölçeği kullanılır; keyfi piksel değerleri (`p-[13px]`) yazılmaz.

| Değer | Kullanım |
|---|---|
| `gap-1` – `gap-2` (4-8px) | İkon ile metin, çip içi, sıkı satır öğeleri |
| `gap-3` – `p-3` (12px) | Form alanları arası, kart içi |
| `gap-4` – `p-4` (16px) | Kart dolgusu, bölüm içi gruplar |
| `gap-6` – `gap-8` (24-32px) | Sayfa bölümleri arası |

- **Kontrol yükseklikleri:** masaüstünde 32px (`sm:h-8`), mobilde 36px (`h-9`). Küçük: 28/32px, büyük: 36/40px. Bu ölçek `Button`, `Input`, `Select` varyantlarındadır; yeniden tanımlama.
- **Dokunma alanı:** dokunmatik ekranda en az 44×44px. Butonlar bunu `pointer-coarse:after:min-h-11` ile sağlar; küçük ikon kontrolleri için `touch-hitbox` yardımcı sınıfını kullan.
- Sakinlik için boşluk cömert, yoğunluk görev listelerinde ve panoda yüksek tutulur. Aynı ekran içinde boşluk ritmi tutarlı olur.
- Avatar ve ikonlar esnek kutuda `shrink-0` alır; ovalleşmez.

## 6. Köşe yuvarlaklığı

Taban değer `--radius: 0.625rem` (10px).

| Sınıf | Değer | Kullanım |
|---|---|---|
| `rounded-sm` | 6px | Küçük rozet, iç öğe |
| `rounded-md` | 8px | Küçük buton (`xs`), çip, menü öğesi |
| `rounded-lg` | 10px | Buton, input, select (varsayılan kontrol) |
| `rounded-xl` | 14px | Kart, popover, diyalog |
| `rounded-full` | — | Avatar, pill rozet, ilerleme çubuğu |

- İç içe öğelerde iç köşe = dış köşe − dolgu (ör. butonun `before:rounded-[calc(var(--radius-lg)-1px)]` kalıbı).
- Aynı yüzeyde farklı yuvarlaklıkları karıştırma; yeni değer ekleme.

## 7. Animasyon kuralları

### 7.1 Önce karar: animasyon gerekli mi?

| Kullanım sıklığı | Karar |
|---|---|
| Günde yüzlerce kez (klavye kısayolu, komut paleti, görev listesinde gezinme) | **Animasyon yok.** |
| Günde onlarca kez (hover, liste seçimi, sekme değişimi) | Yalnızca renk/opaklık, çok kısa ya da hiç |
| Ara sıra (menü, popover, diyalog, toast, çekmece) | Standart animasyon |
| Nadiren (ilk kurulum, boş durum) | Hafif bir giriş yeterli; kutlama efekti yok |

Bir animasyonun geçerli amacı olmalı: **geri bildirim** (basma), **durum değişimi**, **mekânsal tutarlılık** (açılan şeyin nereden geldiği) ya da **sarsıcı değişimi önleme**. "Güzel görünüyor" tek başına gerekçe değildir.

### 7.2 Animasyon kullanılmayacak durumlar

- Klavyeyle tetiklenen her eylem (kısayollar, ok tuşlarıyla gezinme, Enter ile kaydetme).
- Sayfa/rota geçişleri, sekme içeriği değişimi.
- Filtre veya sıralama değiştiğinde listenin yeniden dizilmesi.
- Değişen sayılar ve metinler (sayı sayma, yazı efekti); bunun yerine `tabular-nums`.
- Veri yüklenirken içerik iskeleti dışında hareket; dönen ikonlar yalnızca butonun kendi `loading` durumunda.
- Sürekli/dekoratif hareket (nabız, parıltı, döngüsel animasyon).
- Kullanıcının okuduğu veya düzenlediği içeriğin kendisi (editör metni, görev açıklaması).

### 7.3 Süreler

| Öğe | Süre | Mevcut karşılığı |
|---|---|---|
| Basma geri bildirimi | 100-160ms | Buton `duration-150` |
| Tooltip, küçük popover | 125-200ms | Tooltip/popover `duration-150` |
| Menü, select, açılır liste | 150-250ms | Menu/select `duration-150` |
| Diyalog, sheet/çekmece | 200-300ms | Dialog/sheet `duration-200` |
| Akordeon / daralan panel yüksekliği | 200ms | Accordion/collapsible `duration-200` |

- **Üst sınır 300ms.** Arayüz animasyonu bunu geçmez. Uygulama kabuğunun ilk açılışı (`motion-shell-*`, 400-500ms) yalnızca oturum başına bir kez oynadığı için istisnadır.
- **Çıkış girişten hızlıdır ya da en fazla eşittir.** Kapanan bir şeyi beklemek kimsenin işine yaramaz.
- Tooltip açıkken komşu tooltip'e geçişte gecikme ve animasyon olmaz (`data-instant`).
- Ardışık öğe girişlerinde (stagger) öğeler arası 30-50ms; toplam süre 300ms'i geçmez ve etkileşimi engellemez. Birden fazla öğe birlikte hareket ediyorsa `choreograph` skill'ini kullan.

### 7.4 Easing eğrileri

Özel eğriler `index.css` içindeki `@theme` bloğunda tanımlıdır ve Tailwind'in `ease-out` / `ease-in-out` sınıflarının yerine geçer. Yani bu projede `ease-out` yazmak doğrudan aşağıdaki güçlü eğriyi kullanır; tarayıcının zayıf hazır eğrileri değil.

| Durum | Eğri | Tailwind |
|---|---|---|
| **Giriş ve çıkış** (popover, menü, diyalog, toast) | `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` | `ease-out` |
| **Ekranda yer değiştirme / biçim değişimi** (panel genişlemesi, sekme göstergesi) | `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` | `ease-in-out` |
| Hover'da renk/zemin değişimi | `ease` | `transition-colors` |
| Sabit hızlı ilerleme (yükleme çubuğu) | `linear` | `ease-linear` |
| Sürükle-bırak, momentum | Yay (spring), `bounce` ≤ 0.2 | `motion` |

- **`ease-in` arayüzde kullanılmaz**: yavaş başlar, kullanıcının en dikkatli baktığı anı geciktirir.
- Yeni eğri gerekirse `@theme` içine token olarak eklenir; bileşene gömülmez.

### 7.5 Nasıl animasyon yapılır

- Yalnızca `transform` (`scale`, `translate`) ve `opacity` animasyonu yapılır. `width`, `height`, `top`, `margin` animasyonu yapılmaz (akordeon/collapsible'ın Base UI yükseklik değişkeni istisnadır).
- `transition-all` yasak; özellikleri tek tek yaz: `transition-[scale,opacity,translate]`.
- Hiçbir şey `scale(0)`'dan başlamaz: giriş `scale-98` + `opacity-0` (Base UI `data-starting-style:` / `data-ending-style:`).
- Popover, menü, select ve tooltip tetikleyicisinden açılır: `origin-(--transform-origin)`. Diyaloglar ortada kalır.
- Hızlı tekrar edilebilen etkileşimlerde `@keyframes` yerine CSS `transition` (yarıda kesilebilir).
- `motion` ile listelerde `animate={{ opacity, y }}` kullanılabilir (v14.2+ donanım hızlandırmalı); sürükleme sırasında state yerine `ref.current.style` güncellenir.
- Uzun listeler sanallaştırılır (`@tanstack/react-virtual`); animasyonlu `blur()` 20px'i geçmez; `will-change` yalnızca bir sorun görüldüğünde eklenir.

### 7.6 `prefers-reduced-motion`

Azaltılmış hareket "sıfır animasyon" değil, **hareketsiz geri bildirim** demektir.

- Konum ve ölçek animasyonları (`translate`, `scale`) kaldırılır; anlam taşıyan **opaklık ve renk geçişleri kalır**.
- `index.css` içindeki global kural Base UI açılır pencerelerinde (`[data-slot="…-popup"]`, toast, sheet) bunu zaten yapar. **Yeni bir açılır öğe eklerken `data-slot` değerini bu listeye ekle.**
- Tailwind'de `motion-reduce:` varyantını kullan (`motion-reduce:transition-none`, `motion-reduce:translate-y-0`).
- `motion` kütüphanesinde `useReducedMotion()` ile hareket mesafesini 0'a indir.
- Sürükle-bırakta sürüklenen öğe imleci izlemeye devam eder; yalnızca diğer kartların kayma animasyonu kapanır (`[data-kaneo-sortable]`).

## 8. Etkileşim kuralları

### 8.1 Hover

- Hover yalnızca zemin/kenarlık rengini değiştirir: `hover:bg-accent`, `hover:bg-primary/90`, `hover:border-*`. Hover'da büyüme, zıplama, gölge büyütme yok.
- Tailwind v4'te `hover:` yalnızca fare/hassas işaretçi olan cihazlarda çalışır; dokunmatikte yanlış hover oluşmaz. Ham CSS yazıyorsan `@media (hover: hover) and (pointer: fine)` ile sınırla.
- Hover bilgi saklamak için kullanılmaz: önemli eylemler hover'a bağlı gizli olmaz (dokunmatikte ve klavyede ulaşılamaz).

### 8.2 Basma (press) ve basılı tutma

- Basılabilen her öğe basıldığında küçülür: `active:scale-[0.97]`, `transition-[scale] duration-150 ease-out`. Ölçek aralığı 0.95-0.98. `Button` bunu zaten yapar; kendi tıklanabilir öğende de uygula.
- Basılı/seçili durum `data-pressed` ile gösterilir (hover ile aynı zemin).
- **Basılı tutarak onaylama** (ör. kalıcı silme) gerekiyorsa: basılıyken yavaş ve doğrusal ilerleme (~1.5-2s, `linear`), bırakınca hızlı geri dönüş (200ms, `ease-out`). Kullanıcının karar verdiği yer yavaş, sistemin cevap verdiği yer hızlıdır.
- Devre dışı öğeler `opacity-64` ve `pointer-events-none` alır; yükleniyor durumu `loading` prop'u ile (metin gizlenir, spinner görünür, genişlik korunur).

### 8.3 Odak (focus)

- Odak halkası yalnızca klavyeyle gelindiğinde görünür: `focus-visible:`, `focus:` değil.
- **Butonlar ve menü öğeleri:** `focus-visible:ring-2 ring-ring ring-offset-1 ring-offset-background`.
- **Form alanları:** `focus-visible:border-ring` + `ring-[3px] ring-ring/24`; hatalı alanda `border-destructive/64` + `ring-destructive/16`.
- Temel stil tüm öğelere `outline-ring/50` verir. `outline-none` yazıyorsan yerine mutlaka görünür bir halka koy.
- Diyalog açılınca odak içeri taşınır, kapanınca tetikleyiciye döner (Base UI bunu yapar; özel bileşende bozma).

### 8.4 Klavye erişilebilirliği

- Fareyle yapılabilen her şey klavyeyle de yapılabilir: Tab ile ulaşılır, Enter/Space ile tetiklenir, Esc ile açılır pencere kapanır.
- Menü, select, combobox ve sekmelerde ok tuşları çalışır (Base UI bileşenlerini kullan; `div` + `onClick` ile yeniden yazma).
- Pano kartları klavyeyle seçilebilir ve taşınabilir olmalıdır; sürükle-bırak tek yol değildir.
- Sadece ikondan oluşan butonlar `aria-label` taşır (metin i18n'den); gerekirse tooltip ile görünür etiket verilir.
- Klavye kısayolları animasyonsuz ve anında çalışır; kısayollar menüde `kbd` bileşeniyle gösterilir.
- Sekme sırası görsel sırayla aynıdır; `tabIndex` pozitif değer almaz.

## 9. Bilinen sapmalar (henüz değiştirilmedi)

Mevcut arayüz bu kurallara büyük ölçüde uyuyor. İncelemede görülen ve ileride ele alınacak noktalar:

| Konum | Şu an | Kurala göre | Neden |
|---|---|---|---|
| Komut paleti (`components/ui/command.tsx`) | 200ms ölçek + opaklık girişi | Animasyonsuz açılış/kapanış | Günde onlarca-yüzlerce kez açılır, klavyeyle tetiklenir |
| Popover, menü, diyalog çıkışları | Giriş ile aynı süre | Çıkış daha kısa (ör. 100-150ms) | Kapanan öğeyi beklemek gereksiz |
| Uygulama kabuğu (`motion-shell-rise`) | 500ms | İstisna olarak kabul (oturum başına bir kez) | Sık görülmüyor |
| Ödeme onayı (`billing/drawn-check.tsx`) | 300-500ms çizim animasyonu | İstisna olarak kabul (nadir an) | Nadir, tek seferlik geri bildirim |

## 10. Kontrol listesi (arayüz değişikliği öncesi)

- [ ] Mevcut `components/ui` bileşeni ve token kullanıldı; yeni hex renk, yazı tipi, yuvarlaklık veya keyfi piksel yok.
- [ ] Açık ve koyu temada kontrol edildi.
- [ ] Animasyonun bir amacı var; sıklık tablosuna göre gerekli; süre ≤ 300ms; çıkış ≤ giriş.
- [ ] Giriş/çıkışta `ease-out`, yer değiştirmede `ease-in-out`; `ease-in` ve `transition-all` yok.
- [ ] Yalnızca `transform`/`opacity` animasyonu; `scale(0)` yok; popover kökeni tetikleyicide.
- [ ] `prefers-reduced-motion` altında hareket kalkıyor, opaklık kalıyor.
- [ ] Basma geri bildirimi, `focus-visible` halkası, klavyeyle tam kullanım, ikon butonlarda `aria-label`.
- [ ] Dokunmatikte 44px dokunma alanı; mobilde 16px metin.
- [ ] Tüm metinler i18n anahtarı; sayılarda `tabular-nums`, çoğullar doğru.
