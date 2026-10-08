# 📋 سجل وميثاق المشاكل والحلول الهندسية — GMAO Industrial Architecture
## Comprehensive Issues, Fixes & Architectural Ledger (`ISSUES_AND_FIXES_PLAN.md`)

> **الإصدار:** v4.2.0  
> **تاريخ التحديث:** أكتوبر 2026  
> **حالة النظام الإجمالية:** ✅ جميع المشاكل موثقة ومحلولة بنسبة 100% (All Issues Resolved & Fully Verified)  
> **إجمالي الاختبارات الآلية:** 310 / 310 اختبار ناجح (71 أجنحة اختبار / Test Suites)  
> **جودة الكود والتجميع:** ESLint 0 Errors / 0 Warnings — Production Build Succeeded

---

## 📑 فهرس المشاكل والتنظيم العام (Table of Contents & Issue Directory)

يتيح هذا الفهرس التنقل السريع بين فئات المشاكل، والوصول الفوري لكل مشكلة بحسب معرّفها الهندسي الموحّد.

### 🗂️ تصنيفات السجل:
1. [🛡️ أولاً: المشاكل الأمنية وحماية البيانات (Security & Data Protection — SEC)](#1--المشاكل-الأمنية-وحماية-البيانات-security--data-protection--sec)
   - [SEC-01: ثغرة XSS عبر innerHTML عند تصدير سند الحركة](#sec-01-ثغرة-xss-عبر-innerhtml-عند-تصدير-سند-الحركة)
   - [SEC-02: تخزين جلسات المستخدم في localStorage دون حماية](#sec-02-تخزين-جلسات-المستخدم-في-localstorage-دون-حماية)
   - [SEC-03: غياب سياسة أمان المحتوى الصارمة (Content-Security-Policy)](#sec-03-غياب-سياسة-أمان-المحتوى-الصارمة-content-security-policy)
   - [SEC-04: استخدام خوارزمية bcryptjs في الواجهة الأمامية وتهديد حظر المتصفح](#sec-04-استخدام-خوارزمية-bcryptjs-في-الواجهة-الأمامية-وتهديد-حظر-المتصفح)
   - [SEC-05: تخزين الرقم السري الإداري Master PIN في localStorage](#sec-05-تخزين-الرقم-السري-الإداري-master-pin-في-localstorage)
   - [SEC-06: غياب تقييد معدل الطلبات (Rate Limiting) ضد هجمات القوة الغاشمة (Brute Force)](#sec-06-غياب-تقييد-معدل-الطلبات-rate-limiting-ضد-هجمات-القوة-الغاشمة-brute-force)
   - [SEC-07: غياب تعقيم وتحقق مدخلات البيانات الصارم (Input Sanitization & Schema Validation)](#sec-07-غياب-تعقيم-وتحقق-مدخلات-البيانات-الصارم-input-sanitization--schema-validation)

2. [⚡ ثانياً: مشاكل الأداء ومعالجة البيانات الكبيرة (Performance & Scalability — PERF)](#2--مشاكل-الأداء-ومعالجة-البيانات-الكبيرة-performance--scalability--perf)
   - [PERF-01: بطء الأداء بسبب إعادة الحساب المستمرة في useAppCalculations](#perf-01-بطء-الأداء-بسبب-إعادة-الحساب-المستمرة-في-useappcalculations)
   - [PERF-02: الاستخدام المفرط لـ localStorage ومخاطر تجاوز الحصة (Quota Exceeded)](#perf-02-الاستخدام-المفرط-لـ-localstorage-ومخاطر-تجاوز-الحصة-quota-exceeded)
   - [PERF-03: بطء رندر القوائم وجداول المهام الضخمة وغياب التمرير الافتراضي (Virtual Scrolling)](#perf-03-بطء-رندر-القوائم-وجداول-المهام-الضخمة-وغياب-التمرير-الافتراضي-virtual-scrolling)
   - [PERF-04: تضخم حجم حزمة التطبيق الأولى (Bundle Size Bloat) وغياب Lazy Loading](#perf-04-تضخم-حجم-حزمة-التطبيق-الأولى-bundle-size-bloat-وغياب-lazy-loading)

3. [🏛️ ثالثاً: المعمارية وفصل الاهتمامات (Architecture & Separation of Concerns — ARCH)](#3--المعمارية-وفصل-الاهتمامات-architecture--separation-of-concerns--arch)
   - [ARCH-01: عدم وجود خادم خلفي حقيقي (Backend API) واقتصار التطبيق على التخزين المحلي](#arch-01-عدم-وجود-خادم-خلفي-حقيقي-backend-api-واقتصار-التطبيق-على-التخزين-المحلي)
   - [ARCH-02: خلط منطق الأعمال مع التخزين وواجهات العرض (Mixing Concerns)](#arch-02-خلط-منطق-الأعمال-مع-التخزين-وواجهات-العرض-mixing-concerns)
   - [ARCH-03: تعقيد وتشابك إدارة الحالة واستبدالها بمعمارية Zustand الحديثة](#arch-03-تعقيد-وتشابك-إدارة-الحالة-واستبدالها-بمعمارية-zustand-الحديثة)
   - [ARCH-04: تشتت التزامن بين تبويبات المتصفح المتعددة (Multi-Tab Sync Conflicts)](#arch-04-تشتت-التزامن-بين-تبويبات-المتصفح-المتعددة-multi-tab-sync-conflicts)
   - [ARCH-05: غياب حدود عزل الأخطاء (Error Boundaries) على مستوى التبويبات](#arch-05-غياب-حدود-عزل-الأخطاء-error-boundaries-على-مستوى-التبويبات)
   - [ARCH-06: غياب نظام التسجيل المهيكل وتتبع الأخطاء (Structured Logging & Error Tracking)](#arch-06-غياب-نظام-التسجيل-المهيكل-وتتبع-الأخطاء-structured-logging--error-tracking)

4. [🧪 رابعاً: الاختبارات وتغطية الحالات الحدية (Testing & Quality Assurance — TEST)](#4--الاختبارات-وتغطية-الحالات-الحدية-testing--quality-assurance--test)
   - [TEST-01: غياب اختبارات الخصائص العشوائية (Property-Based Testing)](#test-01-غياب-اختبارات-الخصائص-العشوائية-property-based-testing)
   - [TEST-02: غياب اختبارات الحالات الحدية والكميات السالبة والأخطاء الحسابية](#test-02-غياب-اختبارات-الحالات-الحدية-والكميات-السالبة-والأخطاء-الحسابية)
   - [TEST-03: غياب اختبارات الأداء والضغط العالي (High-Load Performance Testing)](#test-03-غياب-اختبارات-الأداء-والضغط-العالي-high-load-performance-testing)
   - [TEST-04: غياب اختبارات التكامل والعمل في وضع عدم الاتصال (Offline & Integration Flows)](#test-04-غياب-اختبارات-التكامل-والعمل-في-وضع-عدم-الاتصال-offline--integration-flows)
   - [TEST-05: اختبارات الأمان والصلاحيات والتشفير (Security & RBAC Test Suite)](#test-05-اختبارات-الأمان-والصلاحيات-والتشفير-security--rbac-test-suite)

5. [📐 خامساً: جودة الكود والأنواع الصارمة (Code Quality & Type Safety — CODE)](#5--جودة-الكود-والأنواع-الصارمة-code-quality--type-safety--code)
   - [CODE-01: غياب الأمان النوعي الشامل وغياب تعريفات TypeScript الصارمة](#code-01-غياب-الأمان-النوعي-الشامل-وغياب-تعريفات-typescript-الصارمة)
   - [CODE-02: ضبط معايير التنسيق والتدقيق الصارم (ESLint + Prettier Engine)](#code-02-ضبط-معايير-التنسيق-والتدقيق-الصارم-eslint--prettier-engine)
   - [CODE-03: إدارة الملفات الثنائية الكبيرة والوثائق الهندسية (Git LFS & Engineering Docs)](#code-03-إدارة-الملفات-الثنائية-الكبيرة-والوثائق-الهندسية-git-lfs--engineering-docs)

6. [📖 سادساً: بروتوكول توثيق المشاكل المستقبلية (Future Issue Documentation Protocol)](#6--بروتوكول-توثيق-المشاكل-المستقبلية-future-issue-documentation-protocol)

---

## 📊 جدول ملخص المشاكل وحالتها الهندسية

| الرمز | المشكلة الهندسية | الأولوية | التصنيف | الحالة | ملف التحقق والاختبار |
|:---|:---|:---:|:---:|:---:|:---|
| **SEC-01** | ثغرة XSS عبر `innerHTML` في سند الحركة | ⭐⭐⭐⭐⭐ P0 | Security | ✅ محلولة بالكامل | `SecurityAndProtection.test.js` |
| **SEC-02** | تخزين الجلسات في `localStorage` | ⭐⭐⭐⭐⭐ P0 | Security | ✅ محلولة بالكامل | `SecurityAndProtection.test.js` |
| **SEC-03** | غياب ترويسات CSP الصارمة | ⭐⭐⭐⭐⭐ P0 | Security | ✅ محلولة بالكامل | `SecurityAndProtection.test.js` |
| **SEC-04** | استخدام `bcryptjs` في Frontend | ⭐⭐⭐⭐⭐ P0 | Security | ✅ محلولة بالكامل | `SecurityAndProtection.test.js` |
| **SEC-05** | تخزين Master PIN في `localStorage` | ⭐⭐⭐⭐⭐ P0 | Security | ✅ محلولة بالكامل | `VaultService.test.ts` |
| **SEC-06** | غياب Rate Limiting لحماية الدخول | ⭐⭐⭐⭐ P1 | Security | ✅ محلولة بالكامل | `AuthContext.test.js` + `server.ts` |
| **SEC-07** | غياب تعقيم وتحقق Zod للمدخلات | ⭐⭐⭐⭐ P1 | Security | ✅ محلولة بالكامل | `ValidationService.ts` + `DataGateway.js` |
| **PERF-01** | إعادة الحساب المستمرة في `useAppCalculations` | ⭐⭐⭐⭐ P1 | Performance | ✅ محلولة بالكامل | `AppCalculations.test.jsx` |
| **PERF-02** | الاستخدام المفرط لـ `localStorage` | ⭐⭐⭐⭐ P1 | Performance | ✅ محلولة بالكامل | `IndexedDBService.test.ts` |
| **PERF-03** | بطء القوائم الكبيرة وغياب Virtual Scrolling | ⭐⭐⭐⭐ P1 | Performance | ✅ محلولة بالكامل | `VirtualScrolling.test.tsx` |
| **PERF-04** | تضخم الحزمة وغياب Code Splitting | ⭐⭐⭐ P2 | Performance | ✅ محلولة بالكامل | `vite.config.ts` + `AppRouter.jsx` |
| **ARCH-01** | عدم وجود Backend حقيقي | ⭐⭐⭐⭐⭐ P0 | Architecture | ✅ محلولة بالكامل | `server.ts` + `backendApiClient.ts` |
| **ARCH-02** | خلط منطق الأعمال مع التخزين (SoC) | ⭐⭐⭐⭐ P1 | Architecture | ✅ محلولة بالكامل | `Container.js` + `DataGateway.js` |
| **ARCH-03** | تعقيد الحالة والحاجة لـ Zustand | ⭐⭐⭐⭐ P1 | Architecture | ✅ محلولة بالكامل | `GmaoZustandStore.test.ts` |
| **ARCH-04** | تضارب التزامن بين التبويبات المتعددة | ⭐⭐⭐⭐ P1 | Architecture | ✅ محلولة بالكامل | `TabSynchronization.test.ts` |
| **ARCH-05** | غياب Error Boundaries بالتبويبات | ⭐⭐⭐ P2 | Architecture | ✅ محلولة بالكامل | `AppRouter.jsx` |
| **ARCH-06** | غياب Structured Logging المتخصص | ⭐⭐⭐ P2 | Architecture | ✅ محلولة بالكامل | `LoggerService.js` |
| **TEST-01** | غياب Property-Based Testing | ⭐⭐⭐⭐ P1 | Testing | ✅ محلولة بالكامل | `incrementalIndex.property.test.ts` |
| **TEST-02** | غياب اختبارات الحالات الحدية والكميات السالبة | ⭐⭐⭐ P2 | Testing | ✅ محلولة بالكامل | `stockCalculation.test.js` |
| **TEST-03** | غياب اختبارات الأداء تحت الضغط العالي | ⭐⭐⭐ P2 | Testing | ✅ محلولة بالكامل | `PerformanceLargeScale.test.js` |
| **TEST-04** | غياب اختبارات وضع العمل دون اتصال | ⭐⭐⭐ P2 | Testing | ✅ محلولة بالكامل | `IntegrationFlowsAndOffline.test.js` |
| **TEST-05** | اختبارات الأمان والخزنة والصلاحيات RBAC | ⭐⭐⭐⭐⭐ P0 | Testing | ✅ محلولة بالكامل | `PermissionGate.test.jsx` + Vault tests |
| **CODE-01** | غياب TypeScript الصارم بالمحركات | ⭐⭐⭐ P2 | Code Quality | ✅ محلولة بالكامل | `src/types/` + `tsconfig.json` |
| **CODE-02** | ضبط ESLint 10 و Prettier | ⭐⭐⭐ P2 | Code Quality | ✅ محلولة بالكامل | `eslint.config.js` (0 errors) |
| **CODE-03** | إدارة ملفات Excel عبر Git LFS وتوثيق docs | ⭐⭐ P3 | Code Quality | ✅ محلولة بالكامل | `GitLfsConfiguration.test.ts` |

---

## 1. 🛡️ المشاكل الأمنية وحماية البيانات (Security & Data Protection — SEC)

### SEC-01: ثغرة XSS عبر innerHTML عند تصدير سند الحركة
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج للغاية)
- **الموقع:** `src/presentation/components/warehouse/MovementVoucherModal.jsx` و `src/utils/sanitize.js`
- **وصف المشكلة:** كان التطبيق يقوم بحقن كود HTML الخام المستخرج من `printRef.current.innerHTML` مباشرة في وثيقة الطباعة أو نافذة المعاينة دون تعقيم، مما يسمح بحقن نصوص خبيثة `<script>` أو وسوم حدثية `onload` / `onerror` عبر حقول الملاحظات أو تسميات المواد.
- **الحل الجذري المطبق:**
  1. إنشاء وحدة تعقيم مركزية في `src/utils/sanitize.js` تستند إلى مكتبة `DOMPurify` لتعقيم كل وسم قبل استخدامه.
  2. تجريد كافة الوسوم الخطرة (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`) وسمات الأحداث.
  3. تعقيم المتغيرات النصية وأسماء الملفات عبر `sanitizeString()` و `sanitizeFilename()`.
  4. فرض ترويسة CSP صارمة داخل النافذة المنبثقة: `script-src 'none'; object-src 'none'`.
- **التحقق الهندسي:** اختبارات وحدة في `src/tests/unit/SecurityAndProtection.test.js` تؤكد تحييد كافة الحمولات الخبيثة بنجاح.

---

### SEC-02: تخزين جلسات المستخدم في localStorage دون حماية
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج للغاية)
- **الموقع:** `src/core/security/AuthService.js` و `src/context/AuthContext.jsx`
- **وصف المشكلة:** كانت الجلسة تخزن في المفتاح `gmao_session_v2` داخل `localStorage` بنص غير مشفر، مما يعرض الجلسة للسرقة في حال حدوث أي ثغرة XSS في المتصفح، مع بقاء الجلسة نشطة حتى بعد إغلاق التبويب.
- **الحل الجذري المطبق:**
  1. حظر تخزين أو قراءة الجلسات النشطة من `localStorage` نهائياً.
  2. توقيع الجلسات رقمياً باستخدام مفتاح HMAC-SHA256 وتخزين الجلسة النشطة في `sessionStorage` المعزول بتبويب التصفح.
  3. حفظ بيانات الجلسة الاحتياطية المشفرة في `IndexedDB` الآمن فقط عبر `indexedDBService`.
  4. تنفيذ ترحيل آلي (Auto Migration) لحذف الجلسات القديمة من `localStorage` فور الإقلاع.
- **التحقق الهندسي:** اختبار `SecurityAndProtection.test.js` يختبر عدم وجود أي توكن جلسة في `localStorage` أثناء تسجيل الدخول والخروج.

---

### SEC-03: غياب سياسة أمان المحتوى الصارمة (Content-Security-Policy)
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج)
- **الموقع:** `server.ts` و `vite.config.ts` و `index.html`
- **وصف المشكلة:** كان التطبيق يعمل دون ترويسات CSP كافية مما سمح بتحميل وتضمين سكربتات خارجية غير مصرح بها وسمح بتأطير الصفحة (Clickjacking).
- **الحل الجذري المطبق:**
  1. إضافة ترويسات أمنية صارمة في الخادم الخلفي `server.ts`:
     - `Content-Security-Policy`: حصر المصادر المسموحة فقط في `'self'` و `'unsafe-inline'` للأنماط والخطوط مع منع الكائنات التفاعلية `object-src 'none'`.
     - `X-Content-Type-Options: nosniff`: لمنع تخمين أنواع MIME.
     - `X-Frame-Options: SAMEORIGIN`: للحماية من Clickjacking.
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
  2. مزامنة نفس السياسة في `vite.config.ts` (خادم التطوير وخادم المعاينة) ووسم `<meta>` في `index.html`.
- **التحقق الهندسي:** اختبارات التحقق من الترويسات في `SecurityAndProtection.test.js` وسلامة خادم Express.

---

### SEC-04: استخدام خوارزمية bcryptjs في الواجهة الأمامية وتهديد حظر المتصفح
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج)
- **الموقع:** `src/core/security/SecurityService.js`
- **وصف المشكلة:** كانت مكتبة `bcryptjs` تنفذ في خيط المعالجة الرئيسي للواجهة الأمامية (Main Thread)، مما يتسبب في تجميد واجهة المستخدم (UI Freeze) عند توليد الهاش مع بطء المعالجة.
- **الحل الجذري المطبق:**
  1. استبدال `bcryptjs` بمحرك التشفير الأصلي غير المتزامن للأجهزة الحديثة `Web Crypto API` (`crypto.subtle`).
  2. تطبيق خوارزمية التشفير القياسية `PBKDF2-SHA256` بـ 100,000 تكرار مع ملح تشفيري عشوائي (Salt) بطول 128-bit.
  3. دعم الترقية الشفافة في الخلفية (Silent Upgrade) لكلمات المرور القديمة المخزنة بنمط `bcrypt` عند تسجيل الدخول الناجح دون إزعاج المستخدم.
- **التحقق الهندسي:** اختبارات المقارنة والتجزئة في `SecurityAndProtection.test.js` تعمل في أقل من 5ms دون أي حجب للواجهة.

---

### SEC-05: تخزين الرقم السري الإداري Master PIN في localStorage
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج)
- **الموقع:** `src/utils/vaultService.js` و `src/core/security/AuthService.js`
- **وصف المشكلة:** كان المفتاح `gmao_admin_pin` مخزناً كنص عادي في `localStorage`، مما يتيح لأي مستخدم يفتح Developer Tools استخراجه وتجاوز صلاحيات المسؤول وتعديل الإعدادات الحساسة.
- **الحل الجذري المطبق:**
  1. إزالة أي كتابة أو قراءة لـ `gmao_admin_pin` من التخزين الدائم للمتصفح.
  2. تطبيق معمارية المعرفة الصفرية (Zero-Knowledge Architecture): يخزن الرمز الإداري والمفتاح المشتق حصرياً في ذاكرة الوصول العشوائي للعملية (`RAM memory-only variable`)، ولا يُكتب أبداً على القرص.
  3. تشفير الخزنة باستخدام خوارزمية `AES-256-GCM` مع اشتقاق المفاتيح بـ 600,000 دورة PBKDF2.
  4. تنظيف وحذف أي بيانات قديمة للمفتاح من التخزين عند الإقلاع.
- **التحقق الهندسي:** `src/tests/security/VaultService.test.ts` و `SecurityAndProtection.test.js`.

---

### SEC-06: غياب تقييد معدل الطلبات (Rate Limiting) ضد هجمات القوة الغاشمة (Brute Force)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `server.ts` و `src/context/AuthContext.jsx`
- **وصف المشكلة:** عدم وجود حدود لعدد محاولات تسجيل الدخول، مما سمح بمحاولات تخمين غير محدودة لكلمات المرور، وكانت العدادات السابقة تفقد قيمتها عند إعادة تحميل الصفحة (`F5`).
- **الحل الجذري المطبق:**
  1. إضافة وسيط `Rate Limiting` على مستوى خادم Express في `server.ts`:
     - مسار `/api/auth/` مقيد بـ 10 محاولات كحد أقصى لكل نافذة زمنية (15 دقيقة) لكل عنوان IP.
     - مسارات الـ API العامة مقيدة بـ 300 طلب لكل دقيقة.
  2. ترقية `RateLimiter` في الواجهة الأمامية (`AuthContext.jsx`) وحفظ حالة الإغلاق والعداد في `sessionStorage` لتقاوم تحديث الصفحة (Anti-F5 Bypass)، وتفعيل إغلاق مؤقت لمدة 15 دقيقة بعد 5 محاولات فاشلة متتالية.
- **التحقق الهندسي:** اختبارات `AuthContext.test.js` وسلامة مسارات `server.ts`.

---

### SEC-07: غياب تعقيم وتحقق مدخلات البيانات الصارم (Input Sanitization & Schema Validation)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/core/validation/ValidationService.ts` و `src/infrastructure/storage/DataGateway.js`
- **وصف المشكلة:** قبول كائنات بيانات المخزون والحركات والآلات دون التحقق من مطابقة الحقول وأنواعها والكميات المقبولة قبل حفظها.
- **الحل الجذري المطبق:**
  1. كتابة مخططات تحقق صارمة باستخدام مكتبة `Zod` في `ValidationService.ts` لكافة الكيانات (`stockItemSchema`, `machineSchema`, `movementSchema`, `userSchema`, `correctiveSchema`).
  2. ربط بوابة الكتابة المركزية `DataGateway.js` بتعقيم الكائنات المباشر عبر `sanitizeObject()` والتحقق من صحة المخطط قبل الإرسال إلى التخزين.
- **التحقق الهندسي:** اختبارات التحقق في `ValidationService.ts` واختبارات التكامل لبوابة البيانات.

---

## 2. ⚡ مشاكل الأداء ومعالجة البيانات الكبيرة (Performance & Scalability — PERF)

### PERF-01: بطء الأداء بسبب إعادة الحساب المستمرة في useAppCalculations
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/hooks/useAppCalculations.js` و `src/services/reactiveCalculationEngine.js`
- **وصف المشكلة:** كان خطاف `useAppCalculations` يعيد حساب كافة مؤشرات المخزون والتسميات والتشخيصات عند كل تغيير طفيف في أي مصفوفة، مما تسبب في دورة رندر مزدوجة (Double Render Cycle) وبطء ملحوظ في استجابة الواجهة.
- **الحل الجذري المطبق:**
  1. مزامنة فهرس المخزون التزايدي (`Synchronous Index Sync`) فوراً عند تغير مرجع الحركات قبل تنفيذ الـ memoization، مما ألغى الدورة المزدوجة بالكامل.
  2. فك الارتباط المرجعي للمحددات (`Selector Decoupling`): فصل حساب `effectiveDesignations` ليرتبط فقط بـ `[designations, rawStock]` دون التأثر بحركات المخزون المتكررة.
  3. بناء محددات حالة مخبأة معمارياً بنمط Reselect (`createMemoizedSelector` و `selectStockItems` و `selectEffectiveDesignations`) وتغليف الدوال بـ `useCallback`.
  4. تطبيق كاش مرجعي `O(1)` في محرك الحسابات التفاعلي `reactiveCalculationEngine.js` مع كاش `WeakMap` لحساب الـ KPIs ومزامنة كسولة (Lazy On-Demand) لحسابات الجداول المعقدة.
- **التحقق الهندسي:** `src/tests/unit/AppCalculations.test.jsx` (5/5 اختبارات ناجحة تثبت ثبات المراجع `===` وتفادي إعادة الرندر غير الضرورية).

---

### PERF-02: الاستخدام المفرط لـ localStorage ومخاطر تجاوز الحصة (Quota Exceeded)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/infrastructure/database/IndexedDBService.js` و `src/infrastructure/storage/DataGateway.js`
- **وصف المشكلة:** تخزين مئات الآلاف من سجلات الحركات والمخزون في `localStorage` الذي يقتصر على سعة قصوى تبلغ 5 ميغابايت ويعمل بشكل تزامني يحجب الخيط الرئيسي للمتصفح.
- **الحل الجذري المطبق:**
  1. تطبيق معمارية التخزين ثلاثية الطبقات (3-Tier Storage Architecture):
     - **الطبقة الأولى (L1 Memory):** تخزين في الذاكرة الحية بالمتجر (Zustand) للقراءة الفورية `O(1)`.
     - **الطبقة الثانية (L2 IndexedDB):** قاعدة بيانات متصفح متقدمة `CIOB_GMAO_INDUSTRIAL_DB` غير متزامنة مع 8 مخازن مهيكلة ومفهرسة تدعم مئات الآلاف من السجلات دون حجب.
     - **الطبقة الثالثة (L3 LocalStorage Fallback & Compression):** استخدام التخزين المحلي فقط للقيم الإعدادية الصغيرة مع ضغط البيانات عبر `LZ-String` وفحص مستمر للحصة المتاحة في `AutoBackupService.js`.
- **التحقق الهندسي:** `src/tests/unit/IndexedDBService.test.ts` واختبارات الحفظ الدفعي `setItemsBatch`.

---

### PERF-03: بطء رندر القوائم وجداول المهام الضخمة وغياب التمرير الافتراضي (Virtual Scrolling)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/presentation/components/tasks/DetailedTaskListView.jsx` و `src/presentation/components/shared/GmaoIndustrialDataGrid.jsx`
- **وصف المشكلة:** عرض أكثر من 1,000 مهمة صيانة أو مادة مخزنية دفعة واحدة في DOM أدى لإنشاء أكثر من 15,000 عنصر HTML في الصفحة وهبوط معدل الإطارات إلى ما دون 15 إطاراً بالثانية مع تجمد التمرير.
- **الحل الجذري المطبق:**
  1. بناء محرك التمرير الافتراضي الموحد في `DetailedTaskListView.jsx` للنمط المستمر ونمط التجميع حسب الآلة، عبر تسطيح الشجرة إلى صفوف افتراضية محسوبة الإزاحة بدقة.
  2. تقليص عدد عناصر DOM المعروضة في وقت واحد من 15,000+ عنصر إلى أقل من 40 صفاً مرئياً فقط (+ Overscan buffers)، مع الحفاظ على استقرار التمرير عند 60 إطاراً في الثانية (60fps).
  3. دعم محرك الجداول النافذة ومحرك `react-window` v2 في `GmaoIndustrialDataGrid.jsx` عبر المكون الجاهز `VirtualizedIndustrialDataGrid`.
- **التحقق الهندسي:** `src/tests/unit/VirtualScrolling.test.tsx` (5/5 اختبارات تمرير افتراضي ناجحة لـ 1,000 عنصر).

---

### PERF-04: تضخم حجم حزمة التطبيق الأولى (Bundle Size Bloat) وغياب Lazy Loading
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/presentation/router/AppRouter.jsx` و `vite.config.ts`
- **وصف المشكلة:** تحميل كافة الشاشات والمكتبات الثقيلة (XLSX, Charts, Modals) في ملف جافاسكربت واحد كبير عند أول فتح للتطبيق مما أبطأ زمن التحميل الأولي (Time to Interactive).
- **الحل الجذري المطبق:**
  1. تطبيق التحميل الكسول الكامل (`React.lazy` و `Suspense`) لجميع الشاشات الـ 24 في `AppRouter.jsx` مع هياكل تحميل ناعمة (`LoadingSkeleton`).
  2. تقسيم الحزم في `vite.config.ts` عبر `manualChunks`:
     - `vendor-xlsx`: لعزل مكتبات معالجة ملفات الإكسل.
     - `vendor-lucide`: لعزل حزم الأيقونات.
     - `vendor-motion`: لعزل مكتبات الحركة.
     - `vendor-zod`: لعزل محركات التحقق.
- **التحقق الهندسي:** فحص مخرجات `npm run build` وتحقق بنية الحزم المجزأة.

---

## 3. 🏛️ المعمارية وفصل الاهتمامات (Architecture & Separation of Concerns — ARCH)

### ARCH-01: عدم وجود خادم خلفي حقيقي (Backend API) واقتصار التطبيق على التخزين المحلي
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج)
- **الموقع:** `server.ts` و `src/services/backendApiClient.ts`
- **وصف المشكلة:** كان النظام محصوراً بالكامل داخل المتصفح، مما منع مزامنة البيانات بين عدة مهندسين وفنيين على أجهزة مختلفة، ومنع إمكانية إدارة نسخ احتياطية مركزية.
- **الحل الجذري المطبق:**
  1. بناء خادم خلفي كامل للإنتاج والتطوير `server.ts` يعمل ببيئة Node.js + Express.
  2. توفير نقاط نهاية REST API كاملة:
     - `/api/health`: لفحص جاهزية وحالة الخادم.
     - `/api/gmao/state`: لقراءة وحفظ حالة النظام المتكاملة ذرياً مع حفظ البيانات في `data/gmao_state.json`.
     - `/api/gmao/:entity`: لدعم عمليات CRUD الكاملة للكيانات (المخزون، الآلات، أوامر الصيانة، المستخدمين).
     - `/api/gmao/batch`: لمعالجة التحديثات الدفعية وسجلات المزامنة.
  3. بناء عميل الواجهة `backendApiClient.ts` مع دعم العمل بنمط عدم الاتصال الذكي (Offline-First Resilient Architecture) مع التزامن التلقائي عند عودة الاتصال.
- **التحقق الهندسي:** اختبارات الخادم والتكامل ونجاح تشغيل الخادم على المنفذ 3000.

---

### ARCH-02: خلط منطق الأعمال مع التخزين وواجهات العرض (Mixing Concerns)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`
- **وصف المشكلة:** كانت ملفات الـ Hooks ومكونات الواجهة تجمع بين طلب التخزين من `localStorage`، وحسابات الرياضيات المعقدة للمخزون، وعرض عناصر JSX في نفس الملف دون أي فصل هيكلي.
- **الحل الجذري المطبق:**
  1. إعادة بناء النظام وفق معمارية النظافة الصارمة (Clean Hexagonal Architecture) في 4 طبقات منفصلة:
     - **طبقة النطاق (Domain Layer):** الكيانات وقواعد الأعمال الخالصة (`src/domain/`).
     - **طبقة التطبيق (Application Layer):** حالات الاستخدام والعمليات المشتركة (`src/application/`).
     - **طبقة البنية التحتية (Infrastructure Layer):** محركات التخزين وقواعد البيانات والخادم و `DataGateway` (`src/infrastructure/`).
     - **طبقة العرض (Presentation Layer):** مكونات الواجهة والموجه والصفحات الخالصة (`src/presentation/`).
  2. تطبيق حاوية حقن التبعيات `Container.js` لفصل اعتماديات الكود وتسهيل الاختبارات.
- **التحقق الهندسي:** مراجعة هيكل المجلدات واختبارات الوحدات المنفصلة للطبقات.

---

### ARCH-03: تعقيد وتشابك إدارة الحالة واستبدالها بمعمارية Zustand الحديثة
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/store/useGmaoStore.ts` و `src/types/store.ts` و `src/hooks/useGmaoState.js`
- **وصف المشكلة:** تضخم خطاف `useGmaoState` إلى مئات الأسطر مع تعدد الـ sub-hooks وتداخل الـ setters مما سبب صعوبة في تتبع تدفق البيانات وانهيار الأداء عند التحديثات المتزامنة.
- **الحل الجذري المطبق:**
  1. إنشاء متجر Zustand مركزي موحد عالي الكفاءة `src/store/useGmaoStore.ts` مدعوم بالكامل بـ TypeScript الصارم.
  2. توفير شرائح خطافية دقيقة (Fine-Grained Slice Hooks) لتفادي إعادة الرندر:
     - `useStockSlice()`, `useMachineSlice()`, `useWarehouseSlice()`, `useUserSlice()`, `useMovementSlice()`, `usePreventiveSlice()`, `useSortieExterneSlice()`, `useCorrectiveSlice()`.
  3. الحفاظ على التوافق الكامل مع الواجهات والخطافات السابقة لضمان عدم انكسار أي شاشة قديمة.
- **التحقق الهندسي:** اختبارات `src/tests/unit/GmaoZustandStore.test.ts` (اجتازت بنجاح كامل).

---

### ARCH-04: تشتت التزامن بين تبويبات المتصفح المتعددة (Multi-Tab Sync Conflicts)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/services/TabSyncService.ts`
- **وصف المشكلة:** عند فتح النظام في أكثر من تبويب، كانت التعديلات في أحدهما تسبب تضارباً في البيانات أو حلقات رندر دائرية لا نهائية (Infinite Loops) بسبب تكرار معالجة أحداث التزامن المنبعثة من نفس التبويب.
- **الحل الجذري المطبق:**
  1. تطوير خدمة مركزية متقدمة `TabSyncService.ts` تعتمد على بروتوكول `BroadcastChannel` كقناة أساسية مع التراجع المرن إلى `window.addEventListener('storage')`.
  2. تطبيق خاصية قمع الصدى الذكي (**Echo Suppression**) بعزل المعرفات الفريدة للتبويب وتجاهل الرسائل المرتدة من نفس المصدر.
  3. تطبيق استراتيجية حسم التنازعات الزمنية (**Last Write Wins**) للحركات والعمليات المشتركة وتطبيق التحديث الذري في متجر Zustand.
- **التحقق الهندسي:** `src/tests/unit/TabSynchronization.test.ts` (6/6 اختبارات متقدمة ناجحة).

---

### ARCH-05: غياب حدود عزل الأخطاء (Error Boundaries) على مستوى التبويبات
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/presentation/router/AppRouter.jsx` و `src/components/common/ErrorBoundary.jsx`
- **وصف المشكلة:** كان حدوث خطأ غير متوقع في تبويب فرعي واحد يؤدي إلى تحول الشاشة بأكملها إلى اللون الأبيض (White Screen of Death) وتوقف النظام بالكامل.
- **الحل الجذري المطبق:**
  1. تغليف التطبيق بالكامل بحد خطأ رئيسي في `main.jsx`.
  2. تغليف كل تبويب من التبويبات الـ 24 في `AppRouter.jsx` بحد خطأ مستقل `<ErrorBoundary sectionName="...">` يعزل الخطأ داخل التبويب ويعرض واجهة استعادة ناعمة دون التأثير على بقية أجزاء النظام.
- **التحقق الهندسي:** اختبارات بنية الموجه ومحاكاة الأخطاء في التبويبات.

---

### ARCH-06: غياب نظام التسجيل المهيكل وتتبع الأخطاء (Structured Logging & Error Tracking)
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/core/logger/LoggerService.js` و `src/services/ErrorTrackingService.js` و `src/utils/AccessLogService.js`
- **وصف المشكلة:** الاعتماد على `console.log` العشوائي دون تصنيف مستويات الأخطاء أو توفير سجل تدقيق ومسار زمني لتتبع الأعطال.
- **الحل الجذري المطبق:**
  1. بناء خدمة تسجيل مهيكلة تصنف الرسائل إلى مستويات قياسية (`DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`).
  2. تسجيل أحداث الوصول وسجلات الصلاحيات وسجلات العمليات الحساسة في `AccessLogService.js` مع تخزين آمن لآخر 1,000 حدث للرجوع إليها عند الفحص الفني.
- **التحقق الهندسي:** فحص مخرجات الخدمات واختبارات مسار التدقيق.

---

## 4. 🧪 الاختبارات وتغطية الحالات الحدية (Testing & Quality Assurance — TEST)

### TEST-01: غياب اختبارات الخصائص العشوائية (Property-Based Testing)
- **الأولوية:** ⭐⭐⭐⭐ (P1 - عالي)
- **الموقع:** `src/tests/incrementalIndex.property.test.ts`
- **وصف المشكلة:** كانت الاختبارات السابقة تفحص فقط عينات محددة وثابتة من البيانات، مما قد يخفي أخطاء نادرة تظهر فقط مع متواليات عشوائية معينة من الإدخال والإخراج.
- **الحل الجذري المطبق:**
  1. تثبيت ودمج محرك الاختبارات القائمة على الخصائص `fast-check`.
  2. كتابة اختبارات تتحقق من ثوابت المحرك التزايدي عبر آلاف التوليدات العشوائية للحركات:
     - خاصية التكافؤ: `applyDelta ≡ rebuild`.
     - خاصية التراجع الآمن: `rollback invariant`.
     - خاصية التحديث الجزئي: `updateDelta invariant`.
     - خاصية سلامة رصيد المخزون وعدم وجود كميات غير صالحة.
- **التحقق الهندسي:** اجتياز كامل لجميع دورات الاختبار العشوائية في `incrementalIndex.property.test.ts`.

---

### TEST-02: غياب اختبارات الحالات الحدية والكميات السالبة والأخطاء الحسابية
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/tests/stockCalculation.test.js`, `src/tests/stockAvailability.test.js`, `src/tests/unit/FormulaEngineErrorHandling.test.js`
- **وصف المشكلة:** عدم تغطية السيناريوهات الصناعية الشاذة (إدخال كميات سالبة، أرقام عشرية طويلة، حركات لمواد غير موجودة، محاولات صرف تتجاوز الرصيد المتاح).
- **الحل الجذري المطبق:**
  1. بناء أجنحة اختبارات متخصصة تفحص التعامل مع الكميات غير الصالحة، ومحاولات السحب التي تفوق المخزون المتاح، وصيغ الحسابات الشاذة.
  2. التأكد من رمي أخطاء واضحة ومعالجة استباقية تمنع وصول أي بيانات تالفة إلى قاعدة البيانات.
- **التحقق الهندسي:** نجاح 100% لاختبارات الحالات الحدية في `stockCalculation.test.js`.

---

### TEST-03: غياب اختبارات الأداء والضغط العالي (High-Load Performance Testing)
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/tests/unit/PerformanceLargeScale.test.js` و `src/tests/performance/`
- **وصف المشكلة:** غياب اختبارات تفحص قدرة التطبيق على تحمل قواعد بيانات صناعية تضم آلاف المواد وعشرات الآلاف من الحركات.
- **الحل الجذري المطبق:**
  1. كتابة اختبارات محاكاة بيانات حقيقية ضخمة (10,000 مادة و 100,000 حركة مخزنية).
  2. قياس زمن تنفيذ الحسابات التزايدية والتأكد من إنجاز العمليات في أقل من 35 ميلي ثانية دون تجاوز الذاكرة.
- **التحقق الهندسي:** اجتياز اختبارات مقاييس الأداء في `PerformanceLargeScale.test.js`.

---

### TEST-04: غياب اختبارات التكامل والعمل في وضع عدم الاتصال (Offline & Integration Flows)
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/tests/unit/IntegrationFlowsAndOffline.test.js` و `src/tests/movementRepository.integration.test.ts`
- **وصف المشكلة:** عدم اختبار سيناريو انقطاع الإنترنت أو فشل الخادم أثناء قيام الفني بتسجيل حركة مخزنية أو إتمام أمر صيانة.
- **الحل الجذري المطبق:**
  1. اختبار دورة العمل الكاملة: حفظ الحركة محلياً في صف الانتظار الموازي `SyncQueueService.ts` ثم مزامنتها تلقائياً مع الخادم عند استعادة الاتصال.
  2. التحقق من سلامة البيانات وسلامة التراجع في حال رفض الخادم للعملية.
- **التحقق الهندسي:** نجاح اختبارات التكامل في `IntegrationFlowsAndOffline.test.js`.

---

### TEST-05: اختبارات الأمان والصلاحيات والتشفير (Security & RBAC Test Suite)
- **الأولوية:** ⭐⭐⭐⭐⭐ (P0 - حرج)
- **الموقع:** `src/tests/security/VaultService.test.ts`, `src/tests/unit/SecurityAndProtection.test.js`, `src/tests/unit/PermissionGate.test.jsx`
- **وصف المشكلة:** الحاجة إلى تأكيد ميكانيكي آلي يمنع ارتداد أي ثغرة أمنية أو خطأ في الصلاحيات.
- **الحل الجذري المطبق:**
  1. كتابة أجنحة اختبارات أمنية تفحص عزل الخزنة المشفرة، حماية الجلسات، منع XSS، وتطبيق ضوابط التحكم في الوصول المبني على الأدوار (RBAC).
  2. إجمالي 71 جناح اختبار (Test Suites) تضم 310 اختبارات آلية تعمل وتجتاز بنسبة 100%.
- **التحقق الهندسي:** نجاح أمر `npx vitest run` لجميع الـ 310 اختبارات.

---

## 5. 📐 جودة الكود والأنواع الصارمة (Code Quality & Type Safety — CODE)

### CODE-01: غياب الأمان النوعي الشامل وغياب تعريفات TypeScript الصارمة
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `src/types/` و ملفات المحركات الرئيسية (`.ts`)
- **وصف المشكلة:** الاعتماد على JavaScript غير محدد الأنواع في المحركات الحساسة مما تسبب في أخطاء `TypeError: undefined` أثناء التشغيل عند تغيير بنية الكائنات.
- **الحل الجذري المطبق:**
  1. إنشاء ملفات تعريف أنواع مركزية صارمة:
     - `src/types/domain.ts`: لنماذج المخزون والمعدات والمهام.
     - `src/types/store.ts`: لحالة متجر Zustand.
     - `src/types/security.ts`, `sync.ts`, `kpis.ts`.
  2. تحويل الخدمات الحسابية ومحركات الفهرسة إلى TypeScript مع تفعيل فحص `tsconfig.json` الصارم.
- **التحقق الهندسي:** نجاح تدقيق الأنواع وسلامة التجميع بدون أخطاء نوعية.

---

### CODE-02: ضبط معايير التنسيق والتدقيق الصارم (ESLint + Prettier Engine)
- **الأولوية:** ⭐⭐⭐ (P2 - متوسط)
- **الموقع:** `eslint.config.js` و `.prettierrc`
- **وصف المشكلة:** وجود تباين في أسلوب كتابة الكود وتحذيرات غير مفحوصة في بعض المكونات.
- **الحل الجذري المطبق:**
  1. ضبط معمارية التدقيق الحديثة `eslint.config.js` (Flat Config) مع قواعد React و TypeScript.
  2. مراجعة وتنظيف كافة الملفات وتحقيق نتيجة: **0 أخطاء و 0 تحذيرات** عند تشغيل `npm run lint`.
- **التحقق الهندسي:** أمر `npm run lint` يمر بنجاح كامل وفوري.

---

### CODE-03: إدارة الملفات الثنائية الكبيرة والوثائق الهندسية (Git LFS & Engineering Docs)
- **الأولوية:** ⭐⭐ (P3 - منخفض)
- **الموقع:** `.gitattributes` و `docs/`
- **وصف المشكلة:** تخزين قوالب Excel الكبيرة مباشرة في شجرة Git دون إدارة ثنائية، مع نقص الأدلة الهندسية للمطورين.
- **الحل الجذري المطبق:**
  1. تكوين `.gitattributes` لترحيل وتتبع كافة ملفات `.xlsx` عبر Git LFS، مع كتابة اختبار تحقق آلي في `src/tests/unit/GitLfsConfiguration.test.ts`.
  2. بناء وتحديث وثائق المطورين والأنظمة الهندسية في مجلد `docs/` (`DEVELOPER_MANUAL.md`, `AI_AGENT_GUIDELINES.md`).
- **التحقق الهندسي:** اختبار إعدادات Git LFS واكتمال ملفات التوثيق.

---

## 6. 📖 بروتوكول توثيق المشاكل المستقبلية (Future Issue Documentation Protocol)

لكل مشكلة جديدة تُكتشف أو يُطلب حلها في المستقبل، **يجب الالتزام بالبروتوكول المعياري التالي** لتوثيقها في هذا الملف:

### 📑 القالب المعياري لإضافة مشكلة جديدة (Standard Template):

```markdown
### [CODE-ID]: [عنوان المشكلة بشكل موجز ودقيق]
- **الأولوية:** [⭐⭐⭐⭐⭐ P0 / ⭐⭐⭐⭐ P1 / ⭐⭐⭐ P2 / ⭐⭐ P3]
- **التصنيف:** [Security / Performance / Architecture / Testing / Code Quality]
- **الموقع:** [المسارات المحددة للملفات المتأثرة]
- **وصف المشكلة:** [شرح موجز للمشكلة الفنية، السيناريو التكراري، والمخاطر الهندسية]
- **الحل الجذري المطبق:**
  1. [الخطوة الهندسية الأولى في الحل]
  2. [الخطوة الهندسية الثانية]
  3. [التعديل المعماري المعتمد]
- **التحقق الهندسي:** [مسار ملف الاختبار الآلي أو أمر الفحص الذي يثبت حل المشكلة]
- **الحالة:** [✅ محلولة بالكامل / 🔄 قيد المعالجة / ⏳ مجدولة]
```

### 🏷️ معايير تسمية الرموز (ID Naming Convention):
- `SEC-XX`: للمشكلات الأمنية، الصلاحيات، والتشفير.
- `PERF-XX`: لمشكلات الأداء، استهلاك الذاكرة، والتمرير والـ Virtualization.
- `ARCH-XX`: لمشكلات المعمارية، الـ Backend، والتزامن، وفصل الاهتمامات.
- `TEST-XX`: لمشكلات الاختبارات والتغطية ومحاكاة الحالات الحدية.
- `CODE-XX`: لمشكلات الأمان النوعي، التنسيق، والمكتبات والتوثيق.

---

> **ملاحظة ختامية:** هذا الملف هو المرجع الأساسي الموحد (Single Source of Truth) لكافة التحديات الهندسية والحلول المنفذة في نظام GMAO الصناعي، ويتم تحديثه باستمرار مع أي تغيير مستقبلي.
