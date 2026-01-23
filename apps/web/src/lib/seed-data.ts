// بيانات تجريبية واقعية للنظام
import type { Order, Supplier, OrderStatus } from "./types";

// أسماء عملاء واقعية
const customerNames = [
  "أحمد محمد العلي",
  "فاطمة عبدالله السالم",
  "خالد سعد الغامدي",
  "نورة حسن القحطاني",
  "عبدالرحمن علي الشهري",
  "سارة محمد الدوسري",
  "يوسف عبدالعزيز المطيري",
  "مريم سعيد الزهراني",
  "عمر فهد العتيبي",
  "هند ناصر الحربي",
];

// أرقام هواتف واقعية
const phoneNumbers = [
  "0501234567",
  "0551234568",
  "0561234569",
  "0541234570",
  "0531234571",
  "0521234572",
  "0581234573",
  "0591234574",
  "0571234575",
  "0501234576",
];

// أدوية واقعية مع تركيزاتها
const medicines = [
  { name: "أوجمنتين", concentration: "1000 مجم", form: "أقراص" },
  { name: "زيثروماكس", concentration: "500 مجم", form: "كبسولات" },
  { name: "فلاجيل", concentration: "500 مجم", form: "أقراص" },
  { name: "نيوروبيون", concentration: "B1+B6+B12", form: "أمبولات" },
  { name: "ديكلوفيناك", concentration: "75 مجم", form: "حقن" },
  { name: "أوميبرازول", concentration: "20 مجم", form: "كبسولات" },
  { name: "ميتفورمين", concentration: "850 مجم", form: "أقراص" },
  { name: "أملوديبين", concentration: "5 مجم", form: "أقراص" },
  { name: "لوسارتان", concentration: "50 مجم", form: "أقراص" },
  { name: "سيمفاستاتين", concentration: "20 مجم", form: "أقراص" },
  { name: "ليفوثيروكسين", concentration: "100 ميكروجرام", form: "أقراص" },
  { name: "مونتيلوكاست", concentration: "10 مجم", form: "أقراص" },
  { name: "سيتريزين", concentration: "10 مجم", form: "أقراص" },
  { name: "باراسيتامول", concentration: "500 مجم", form: "أقراص" },
  { name: "إيبوبروفين", concentration: "400 مجم", form: "أقراص" },
];

// حالات الطلبات
const statuses: OrderStatus[] = [
  "pending",
  "ordered",
  "arrived",
  "delivered",
  "cancelled",
];

// ملاحظات واقعية
const notes = [
  "العميل يحتاج الدواء بشكل عاجل",
  "يفضل التواصل عبر الواتساب",
  "الدواء للاستخدام المزمن",
  "العميل طلب التأكد من تاريخ الصلاحية",
  "يرجى إبلاغ العميل عند وصول الدواء",
  "",
  "",
  "",
];

// أسماء موردين واقعية
const supplierNames = [
  "شركة النهدي للأدوية",
  "مؤسسة الدواء السعودي",
  "شركة الدواء المتحدة",
  "مؤسسة الشفاء للأدوية",
  "شركة الرعاية الصحية",
  "مؤسسة الأمل للأدوية",
  "شركة الحياة الطبية",
  "مؤسسة الصحة الأولى",
];

// عناوين واقعية
const addresses = [
  "الرياض، حي النخيل",
  "جدة، حي الروضة",
  "الدمام، حي الفيصلية",
  "مكة المكرمة، حي العزيزية",
  "المدينة المنورة، حي السلام",
  "الخبر، حي الثقبة",
  "الطائف، حي الشهداء",
  "بريدة، حي الصفراء",
];

// دالة لتوليد تاريخ عشوائي في آخر 30 يوم
function randomDate(daysAgo: number = 30): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date;
}

// دالة لاختيار عنصر عشوائي من مصفوفة
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// دالة لاختيار عدة عناصر عشوائية من مصفوفة
function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// توليد طلبات تجريبية
export function generateSeedOrders(count: number = 15): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(30);
    const updatedAt = new Date(
      createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
    );

    const medicineCount = Math.floor(Math.random() * 3) + 1; // 1-3 أدوية
    const selectedMedicines = randomItems(medicines, medicineCount);

    orders.push({
      id: crypto.randomUUID(),
      customerName: randomItem(customerNames),
      phoneNumber: randomItem(phoneNumbers),
      medicines: selectedMedicines.map((med) => ({
        id: crypto.randomUUID(),
        name: med.name,
        concentration: med.concentration,
        form: med.form,
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 علب
      })),
      status: randomItem(statuses),
      notes: randomItem(notes),
      createdAt,
      updatedAt,
    });
  }

  return orders;
}

// توليد موردين تجريبيين
export function generateSeedSuppliers(count: number = 8): Supplier[] {
  const suppliers: Supplier[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(90);
    const phone = `05${Math.floor(Math.random() * 9)}${Math.floor(
      Math.random() * 10000000,
    )
      .toString()
      .padStart(7, "0")}`;
    const whatsapp = Math.random() > 0.3 ? phone : undefined;
    const email = Math.random() > 0.4 ? `info@supplier${i + 1}.com` : undefined;

    const medicineCount = Math.floor(Math.random() * 8) + 5; // 5-12 دواء
    const commonMedicines = randomItems(
      medicines.map((m) => m.name),
      medicineCount,
    );

    suppliers.push({
      id: crypto.randomUUID(),
      name: supplierNames[i] || `مورد ${i + 1}`,
      phone,
      whatsapp,
      email,
      address: randomItem(addresses),
      commonMedicines,
      avgDeliveryDays: Math.floor(Math.random() * 5) + 2, // 2-6 أيام
      rating: Math.floor(Math.random() * 2) + 3.5, // 3.5-5
      totalOrders: Math.floor(Math.random() * 50) + 10, // 10-60 طلب
      notes: Math.random() > 0.5 ? "مورد موثوق وسريع في التوصيل" : "",
      createdAt,
      updatedAt: createdAt,
    });
  }

  return suppliers;
}
