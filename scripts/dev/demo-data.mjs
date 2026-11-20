// The demo team, its tasks, whiteboard notes and meeting note. Local test
// accounts only: never reuse these passwords anywhere else.

export const WORKSPACE_NAME = "Deneme Ekibi";
export const PROJECT = { name: "Yaz Projesi", slug: "YAZ", icon: "Sun" };

export const USERS = [
  {
    key: "ayse",
    name: "Ayşe Yılmaz",
    email: "ayse@test.local",
    password: "Ayse-Deneme-2026",
  },
  {
    key: "mehmet",
    name: "Mehmet Demir",
    email: "mehmet@test.local",
    password: "Mehmet-Deneme-2026",
  },
  {
    key: "zeynep",
    name: "Zeynep Kaya",
    email: "zeynep@test.local",
    password: "Zeynep-Deneme-2026",
  },
];

// `week` is a day of the current week (0 = Monday); `month` is the n-th free
// day of the current month outside this week; neither means undated.
export const TASKS = [
  {
    title: "Yaz kampı etkinlik takvimini çıkar",
    assignee: "ayse",
    status: "in-progress",
    priority: "high",
    week: 0,
    days: 3,
  },
  {
    title: "Velilere bilgilendirme mektubunu yaz",
    assignee: "mehmet",
    status: "to-do",
    priority: "high",
    week: 1,
  },
  {
    title: "Kayıt formunu çevrim içi hale getir",
    assignee: "zeynep",
    status: "in-review",
    priority: "medium",
    week: 2,
  },
  {
    title: "Gönüllü öğretmenlerle tanışma toplantısı",
    assignee: "ayse",
    status: "to-do",
    priority: "medium",
    week: 2,
  },
  {
    title: "Malzeme listesini bütçeyle karşılaştır",
    assignee: "mehmet",
    status: "to-do",
    priority: "low",
    week: 3,
  },
  {
    title: "Okul panosuna duyuru afişi as",
    assignee: "zeynep",
    status: "done",
    priority: "low",
    week: 4,
  },
  {
    title: "Haftalık durum toplantısı",
    assignee: "ayse",
    status: "to-do",
    priority: "medium",
    week: 4,
  },
  {
    title: "Ulaşım firmasından teklif al",
    assignee: "mehmet",
    status: "in-progress",
    priority: "high",
    month: 0,
  },
  {
    title: "Spor salonu kullanım iznini al",
    assignee: "zeynep",
    status: "to-do",
    priority: "medium",
    month: 1,
  },
  {
    title: "İlk yardım eğitimini planla",
    assignee: "ayse",
    status: "to-do",
    priority: "urgent",
    month: 2,
    days: 2,
  },
  {
    title: "Katılımcı listesini kesinleştir",
    assignee: "mehmet",
    status: "to-do",
    priority: "medium",
    month: 3,
  },
  {
    title: "Kapanış etkinliği için mekân ayarla",
    assignee: "zeynep",
    status: "to-do",
    priority: "low",
    month: 4,
  },
  {
    title: "Fotoğraf çekimi için veli izinlerini topla",
    assignee: "zeynep",
    status: "to-do",
    priority: "medium",
  },
  {
    title: "Geçen yılın geri bildirimlerini oku",
    assignee: "mehmet",
    status: "to-do",
    priority: "low",
  },
  {
    title: "Yaz projesi sunumunu hazırla",
    assignee: null,
    status: "to-do",
    priority: "no-priority",
  },
];

export const STICKY_NOTES = [
  "Kampın son günü veli şenliği",
  "Her sabah 10 dakika ısınma oyunu",
  "Öğrencilerden tema önerisi iste",
  "Yağmurlu günler için kapalı alan planı",
];

const heading = (text) => ({
  type: "heading",
  props: { level: 2 },
  content: text,
});
const bullet = (text) => ({ type: "bulletListItem", content: text });
const todo = (text) => ({
  type: "checkListItem",
  props: { checked: false },
  content: text,
});

// Same shape as the "Haftalık Toplantı" template in the notes screen, filled in.
export function weeklyMeetingNote(today) {
  return {
    title: `Haftalık Toplantı · ${today}`,
    content: [
      heading("Gündem"),
      bullet("Yaz kampı takviminin son hali"),
      bullet("Ulaşım teklifleri"),
      bullet("Gönüllü öğretmen sayısı"),
      heading("Alınan Kararlar"),
      bullet(
        "Kamp iki hafta sürecek; ilk hafta tanışma etkinlikleri yapılacak.",
      ),
      bullet("Veli mektubu cuma gününe kadar gönderilecek."),
      heading("Yapılacaklar"),
      todo("Ulaşım için üç teklif karşılaştırılacak"),
      todo("Kayıt formu test edilecek"),
      todo("Malzeme siparişi verilecek"),
    ],
  };
}
