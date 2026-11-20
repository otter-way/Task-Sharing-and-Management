# Kendi bilgisayarında deneme rehberi

Bu rehber, Ekip Görev'i kendi bilgisayarında çalıştırıp deneme verisiyle adım adım test etmen için hazırlandı. Teknik bilgi gerekmez; komutları terminale olduğu gibi yapıştırman yeterli.

## Bir kez yapılacaklar

Bilgisayarında şunlar kurulu olmalı:

- **Docker Desktop**: veritabanını çalıştırır. Açık ve hazır olduğundan emin ol (menü çubuğunda balina simgesi).
- **Node.js 24** veya daha yenisi: <https://nodejs.org>
- **pnpm**: Node.js kurulduktan sonra terminalde bir kez `corepack enable` yazman yeterli.

Proje klasöründe şu komut her şeyi hazırlar:

```bash
pnpm kurulum
```

Bu komut sırasıyla şunları yapar: `.env` ayar dosyasını güvenli rastgele şifrelerle oluşturur (dosya zaten varsa dokunmaz), veritabanını Docker'da başlatır, bağımlılıkları kurar ve veritabanı tablolarını hazırlar. İlk seferde birkaç dakika sürebilir; tekrar çalıştırmak zararsızdır.

## Her kullanımda

```bash
pnpm baslat
```

"Uygulama hazır" yazısını görünce tarayıcıda **<http://localhost:5173>** adresini aç. Bu terminal penceresi açık kaldığı sürece uygulama çalışır.

Deneme verisini kurmak ya da sıfırlamak için **ikinci bir terminalde**:

```bash
pnpm deneme-verisi
```

Bu komut "Deneme Ekibi" çalışma alanını siler ve baştan kurar. Kendi oluşturduğun başka çalışma alanlarına dokunmaz.

### Deneme kullanıcıları

Bu hesaplar yalnızca senin bilgisayarındaki deneme içindir; şifreleri başka hiçbir yerde kullanma.

| Kişi | E-posta | Şifre | Rol |
| --- | --- | --- | --- |
| Ayşe Yılmaz | `ayse@test.local` | `Ayse-Deneme-2026` | Çalışma alanının sahibi |
| Mehmet Demir | `mehmet@test.local` | `Mehmet-Deneme-2026` | Üye |
| Zeynep Kaya | `zeynep@test.local` | `Zeynep-Deneme-2026` | Üye |

Deneme verisinde "Yaz Projesi" adlı bir proje, bu hafta ve bu ay içine dağılmış 15 görev (3 tanesi tarihsiz), Fikir Tahtası'nda 4 yapışkan not ve Notlar'da bir "Haftalık Toplantı" sayfası bulunur.

> Uygulamaya kaydolan **ilk hesap sunucu yöneticisi** olur. Deneme verisini kendi hesabını açmadan önce kurduysan yönetici Ayşe olur; bu, deneme için bir sorun değildir.

### Durdurma ve yeniden başlatma

- **Durdurmak:** `pnpm baslat` çalışan pencerede `Ctrl + C`, ardından `pnpm durdur`.
- **Yeniden başlatmak:** `pnpm baslat`. Verilerin korunur.

## Kontrol listesi

Her maddeyi denedikçe işaretle. Beklenen sonuç her maddenin sonunda yazıyor; farklı bir şey olursa en alttaki şablonla bildir.

### 1. Giriş ve çıkış

- [ ] `ayse@test.local` / `Ayse-Deneme-2026` ile giriş yap. → Ana sayfa açılır, sol üstte "Deneme Ekibi" yazar.
- [ ] Sol üstteki "AY" baş harflerine tıkla → **Çıkış yap**. → Giriş sayfasına dönersin.
- [ ] Bilerek yanlış şifreyle giriş yapmayı dene. → Anlaşılır bir hata mesajı görünür, giriş olmaz.

### 2. Görev oluşturma ve atama

- [ ] Ayşe olarak sol menüden **Yaz Projesi**'ni aç. → Görevler panosu açılır (Yapılacak, Devam Ediyor, İncelemede, Tamamlandı).
- [ ] "Yapılacak" sütunundaki **+** düğmesine tıkla, bir başlık yaz (ör. "Kamp tişörtlerini sipariş et"), **Sorumlu** olarak Mehmet'i, **Bitiş Tarihi** olarak yarını seç, **Görev Oluştur**. → Kart sütunda belirir, sağ üstünde "MD" yazar.
- [ ] Karta tıklayıp aç, Sorumlu'yu Zeynep yap, pencereyi kapat. → Kartta "ZK" görünür.

### 3. Takvim: Hafta görünümünde sürükleyerek tarih değiştirme

- [ ] Panonun sağ üstündeki **Görünüm** simgesine (kaydırıcılar) tıkla → **Takvim**. → Pazartesi'den Pazar'a bu hafta görünür; sağda **Tarihsiz** listesi vardır.
- [ ] Bir görevi fareyle tutup başka bir güne sürükle ve bırak. → Görev yeni gününe yumuşakça yerleşir.
- [ ] Sayfayı yenile (`F5` / `Cmd + R`). → Görev yeni gününde kalmıştır.
- [ ] **Tarihsiz** listesinden bir görevi bir güne sürükle. → Göreve tarih verilir, listeden çıkar.
- [ ] Tarihli bir görevi **Tarihsiz** listesine sürükle. → Tarihi silinir.
- [ ] **‹ ›** oklarıyla haftalar arasında gezin, sonra **Bu hafta**'ya tıkla. → Bu haftaya dönersin.

### 4. Takvim: Ay görünümünde sürükleme

- [ ] Takvimin sol üstünden **Ay**'ı seç. → Bütün ay görünür; birkaç güne yayılan görevler ("Yaz kampı etkinlik takvimini çıkar" gibi) çubuk olarak uzanır.
- [ ] Bir görevi başka bir güne sürükle. → Yeni gününe taşınır; yeniledikten sonra da orada kalır.
- [ ] Bir günün altında "+N daha" yazıyorsa ona tıkla. → O günün bütün görevleri listelenir.

### 5. "Sadece benim görevlerim" filtresi

- [ ] Ayşe olarak takvimde **Sadece benim görevlerim**'e tıkla. → Yalnızca Ayşe'ye atanmış görevler kalır ("Yaz kampı etkinlik takvimini çıkar", "Haftalık durum toplantısı" vb.).
- [ ] Aynı düğmeye tekrar tıkla. → Bütün görevler geri gelir.

### 6. Fikir Tahtası'ndan göreve dönüştürme

- [ ] Proje sekmelerinden **Fikir Tahtası**'nı aç. → Dört sarı yapışkan not görünür.
- [ ] Bir notun üzerine tıkla. → Sağ üstte **Göreve dönüştür** düğmesi çıkar.
- [ ] **Göreve dönüştür**'e tıkla. → "YAZ-.. oluşturuldu" bildirimi gelir, düğme "YAZ-.. görevini aç" olur.
- [ ] **Görevler** sekmesine dön. → Notun metni yeni bir görev olarak "Yapılacak" sütunundadır.
- [ ] Fikir Tahtası'nda araç çubuğundan metin aracını (**A**) seçip tuvale kendi fikrini yaz, birkaç saniye bekle. → Üstte "Kaydedildi" yazar; sayfayı yenileyince yazın yerindedir.

### 7. Not şablonları

- [ ] **Notlar** sekmesini aç. → "Haftalık Toplantı · …" notu listededir; açınca Gündem, Alınan Kararlar ve Yapılacaklar başlıklarını görürsün.
- [ ] **Yeni not** menüsünü aç. → Boş not, Haftalık Toplantı ve Beyin Fırtınası Özeti seçenekleri vardır.
- [ ] **Beyin Fırtınası Özeti**'ni seç. → Konu, Fikirler, Öne Çıkan Fikirler ve Sonraki Adımlar başlıklarıyla yeni bir not açılır.
- [ ] Bir şeyler yaz, birkaç saniye bekle. → "Kaydedildi" yazar.
- [ ] İmleci "Yapılacaklar" altındaki bir onay kutulu maddeye koy. → Sağ üstte **Göreve dönüştür** çıkar; tıklayınca o madde görev olur.

### 8. Farklı bir kullanıcıyla paylaşılan görevi görme

- [ ] Tarayıcıda gizli pencere aç (Chrome: `Ctrl + Shift + N`, Mac'te `Cmd + Shift + N`) ve **Mehmet** ile giriş yap.
- [ ] Sol menüden **Görevlerim**'i aç. → Mehmet'e atanmış görevler listelenir.
- [ ] İki pencereyi yan yana koy: Ayşe'nin penceresinde bir görevin başlığını değiştir. → Mehmet'in penceresinde, sayfayı yenilemeden birkaç saniye içinde güncellenir.
- [ ] Ayşe olarak bir görevi Mehmet'e ata. → Mehmet'in **Gelen kutusu**'nda bildirim belirir.

### 9. Telefonda görünüm

Bunu gerçek bir telefon olmadan, bilgisayardaki Chrome ile deneyebilirsin:

1. Uygulama açıkken `F12` tuşuna bas (Mac'te `Cmd + Option + I`). Sağda ya da altta geliştirici paneli açılır.
2. Panelin sol üstündeki **telefon-tablet simgesine** tıkla (ya da `Ctrl + Shift + M`, Mac'te `Cmd + Shift + M`).
3. Sayfanın üstünde çıkan cihaz listesinden **iPhone 12 Pro**'yu seç ve sayfayı yenile.
4. İşin bitince aynı simgeye tekrar tıklayarak normal görünüme dön.

- [ ] Sol üstteki menü simgesiyle kenar çubuğu açılıp kapanıyor.
- [ ] Takvim **Hafta** görünümünde günler alt alta sıralanıyor; Tarihsiz listesi altta ve kendi içinde kayıyor.
- [ ] **Ay** görünümü telefonda gün gün bir liste olarak görünüyor.
- [ ] Görev detayı tam ekran açılıyor; başlık ve alanlar okunabiliyor.
- [ ] Hiçbir sayfada ekran yana kaymıyor, yazılar taşmıyor.
- [ ] Cihaz listesinin yanındaki döndürme simgesiyle yatay görünüme geç. → Takvim hâlâ görünür ve kullanılabilir.

## Hata bildirme şablonu

Bir sorun gördüğünde aşağıdaki şablonu kopyalayıp doldur ve bana gönder. Ekran görüntüsü için: Windows'ta `Win + Shift + S`, Mac'te `Cmd + Shift + 4`.

```text
Başlık: (tek cümle, ör. "Ay görünümünde sürüklenen görev eski güne dönüyor")

Ne yaptım:
1.
2.
3.

Ne bekliyordum:

Ne oldu:

Hangi kullanıcıyla: (Ayşe / Mehmet / Zeynep / kendi hesabım)
Nerede: (ör. Yaz Projesi > Takvim > Ay)
Telefon görünümü mü?: (evet / hayır)
Her seferinde oluyor mu?: (her seferinde / bazen / bir kez oldu)

Ekran görüntüsü: (ekle)
```
