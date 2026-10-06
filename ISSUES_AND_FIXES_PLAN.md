# 📋 خطة الإصلاح الشاملة - CIOB GMAO v4
## Comprehensive Issues Resolution & Implementation Plan

---

## 📊 ملخص المشاكل حسب الأولوية

| الأولوية | العدد | النوع | الحالة |
|---------|-------|-------|--------|
| 🔴 **حرجة (P0)** | 6 | أمان + بيانات | **فوري - أسبوع 1** |
| 🟠 **عالية (P1)** | 8 | أداء + بنية | **أسبوع 2-3** |
| 🟡 **متوسطة (P2)** | 7 | صيانة + توثيق | **أسبوع 4-6** |

**الإجمالي: 21 مشكلة** ⚠️

---

# 🔴 المشاكل الحرجة (P0) - تم التنفيذ والتوثيق

## **P0-1: ترقية اشتقاق المفاتيح PBKDF2 إلى 600,000 تكرار**
- **الحالة**: ✅ مُنفذة ومُحدثة في `src/utils/vaultService.js` و `src/infrastructure/security/VaultService.js`.
- **الآلية**: 600,000 دورة تجزئة مع فك تشفير رجعي ذكي للخزائن السابقة وترقيتها التلقائية عند الدخول.

## **P0-2: عزل المفاتيح وتوليد الأملاح ديناميكياً**
- **الحالة**: ✅ مُنفذة. لا توجد مفاتيح صريحة ثابتة، وتوليد أملاح عشوائية عبر `crypto.getRandomValues`.

## **P0-3: توقيع الجلسات الرقمي (Session HMAC Signing)**
- **الحالة**: ✅ مُنفذة في `src/core/security/SecurityService.js` و `src/core/security/AuthService.js`.

## **P0-4: ترويسة سياسة أمان المحتوى (CSP Headers)**
- **الحالة**: ✅ مُنفذة ومُثبتة في `index.html` لمنع هجمات XSS.

## **P0-5: فحوصات التكامل المرجعي (Referential Integrity)**
- **الحالة**: ✅ مُنفذة في `src/services/dataIntegrityService.js` و `src/application/DataGateway.js`.

## **P0-6: محرك النسخ الاحتياطي المضغوط والمؤمن (Zero-Knowledge Backups)**
- **الحالة**: ✅ مُنفذة في `src/core/backup/AutoBackupService.js` و `src/utils/BackupService.js`.

---

# 🟠 المشاكل العالية (P1)

## **P1-1: توحيد مجلدات الاختبارات في مسار قياسي موحد (`src/tests/`)**
- **الحالة**: ✅ مُنفذة ومُحدثة. تم دمج كافة الاختبارات في `src/tests/` (الوحدات `unit/`، التكامل `integration/`، والتسلسل `e2e/`، والأمان `security/` والأداء `performance/`) وحذف المجلدات المتفرقة (`src/__tests__` و `src/test`).

## **P1-2: تعميم الـ Virtual Scrolling للجداول الضخمة عبر `react-window` و `GmaoIndustrialDataGrid`**
- **الحالة**: ✅ مُنفذة ومُحدثة.
- **الآلية**:
  1. توحيد وترقية `src/presentation/components/common/VirtualizedTable.jsx` ليتوافق مع `react-window` v2 (`rowComponent`, `rowCount`, `rowHeight`, `overscanCount`) وحذف النسخة المكررة.
  2. دمج محرك التمرير الافتراضي (Windowed Virtual Scrolling بسرعة 60fps) مباشرة في الشبكة الموحدة `GmaoIndustrialDataGrid.jsx` و `DetailedTaskListView.jsx` لتفعيل التقطيع التلقائي (Windowing) عند تجاوز عتبة الـ 50 صفاً (مثل اختيار `Tout` أو عرض آلاف الحركات/الأصناف/التدخلات) دون المساس برؤوس الجداول المثبتة (`Sticky thead`) أو القوائم المنبثقة.

## **P1-3: استكمال التحويل التدريجي إلى TypeScript الصارم**
- **الحالة**: ⏳ قيد التنفيذ للمرحلة التالية.

---

# 🟡 المشاكل المتوسطة (P2)

1. **P2-1**: تهيئة إدارة ملفات Excel الثنائية عبر Git LFS.
2. **P2-2**: إضافة قناة التزامن السحابي التكميلي (Phase 3).
