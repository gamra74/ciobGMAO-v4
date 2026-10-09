# 🛠️ سجل المشاكل الهندسية وخطة الإصلاحات المعتمدة (Engineering Issues & Fixes Plan)

> **منهجية التقييم:** يعتمد هذا المستند تقييماً هندسياً واقعياً ومباشراً مبنياً على الفحص الفعلي للشيفرة المصدرية والاختبارات الميدانية، دون أي نسب مئوية تضخيمية أو تصنيفات دعائية.
> - للنسخة المؤرشفة السابقة، راجع: [`docs/history/ARCHIVED_ISSUES_PLAN_v4.md`](./docs/history/ARCHIVED_ISSUES_PLAN_v4.md).

---

## 📊 دليل حالات التصنيف (Status Legend)

| الرمز | الحالة | التعريف الهندسي |
| :--- | :--- | :--- |
| 🟢 | **محلول (Resolved)** | تم تنفيذ الحل بالكامل في الشيفرة المصدرية، والتحقق منه عبر البناء (`compile_applet`) والفحص (`lint_applet`) والاختبار الوظيفي. |
| 🟡 | **جزئي (Partial / In-Progress)** | تم إنجاز الجزء الأساسي من المعالجة مع بقاء مهام تنظيف معماري أو تحسينات إضافية قيد المتابعة. |
| 🔴 | **مفتوح (Open / Backlog)** | متطلبات مستقبلية أو تحسينات مرصودة في قائمة الانتظار لم يبدأ تنفيذها بعد. |

---

## 1. وحدة المصدر المرجعي للبيانات والتخزين (Data SSOT & Persistence)

| المعرف | المشكلة المرصودة | الحالة | التفاصيل الهندسية والحل المنفّذ |
| :--- | :--- | :--- | :--- |
| **DATA-01** | **تعارض البيانات بعد Clear / Reset / Demo وانبعاث بذور الديمو عند F5** | 🟢 **محلول (Resolved)** | تم حصر كافة مسارات الكتابة والتفريغ والتحميل عبر `src/application/DataGateway.ts` كمسار كتابة أحادي (Single Write Path). عند استدعاء `clearAllForRealFactory` يتم تثبيت `DEMO_MODE = false` و `START_MODE = 'empty'` صراحةً في `storageService` و `localStorage`، وحذف اللقطة المجمعة `FULL_STATE_SNAPSHOT`، وكتابة `[]` على جميع المفاتيح الـ Canonical، وتعطيل استعادة اللقطة في `migrateStorage.ts` و `App.tsx` أثناء وضع المصنع الفارغ. |
| **DATA-02** | **غياب بروتوكول اختبار يدوي موثق للتحقق من ثبات SSOT** | 🟢 **محلول (Resolved)** | تم إنشاء وتوثيق بروتوكول الاختبار اليدوي الخماسي في [`docs/MANUAL_SSOT_TEST.md`](./docs/MANUAL_SSOT_TEST.md) بـ 5 خطوات متسلسلة: (1. بدء فارغ `START_MODE=empty` ← 2. تحميل ديمو `loadDemoData` ← 3. تصفير شامل `clearAllForRealFactory` ← 4. إضافة 3 مهام وقائية في `gmao_preventive_tasks_v9` ← 5. تحديث `F5` والتأكد من بقاء المهام الثلاث فقط دون انبعاث بذور الديمو). |
| **DATA-03** | **ترحيل المفاتيح القديمة (Legacy Keys Migration)** | 🟢 **محلول (Resolved)** | تعمل دالة `migrateStorageOnce()` في `src/infrastructure/persistence/migrateStorage.ts` عند الإقلاع لترحيل البيانات من المفاتيح القديمة إلى المفاتيح الـ Canonical لمرة واحدة ثم تنظيف المفاتيح المهجورة. |

---

## 2. المزامنة مع الخادم وإدارة التعارض (Server Synchronization & Conflict Resolution)

| المعرف | المشكلة المرصودة | الحالة | التفاصيل الهندسية والحل المنفّذ |
| :--- | :--- | :--- | :--- |
| **SYNC-01** | **غموض توقيت المزامنة مع الخادم (`gmao_state.json`)** | 🟢 **محلول (Resolved)** | تم بناء خدمة `src/services/serverSyncService.ts` وتوفير أزرار تحكم يدوية صريحة («حفظ على الخادم» / «استعادة من الخادم») عبر كبسولة **Sync Serveur** في الشريط العلوي (`Header.tsx`) وبطاقة المزامنة في شاشة الإعدادات (`SettingsView.tsx` و `PerformanceDashboardPanel.tsx`)، مع حظر أي مزامنة صامتة متكررة في الخلفية (No Silent Background Polling). |
| **SYNC-02** | **غياب آلية فض التعارض بين نسخة المتصفح ونسخة الخادم** | 🟢 **محلول (Resolved)** | تم تطوير دالة `detectConflict` في `serverSyncService.ts` ونافذة فض التعارض التفاعلية `src/presentation/components/common/ServerSyncConflictModal.tsx` التي تعرض مقارنة كمية وزمنية دقيقة بين المتصفح و `gmao_state.json` وتمنح المستخدم الخيار الصريح بين فرض الحفظ المحلي أو استعادة بيانات الخادم أو الإلغاء، مع إضافة `DataGateway.loadFullServerState` لتطبيق الحالة مباشرة دون الحاجة لإعادة تحميل الصفحة. |

---

## 3. البنية المعمارية وبيئة التشغيل (Architecture & Runtime Stability)

| المعرف | المشكلة المرصودة | الحالة | التفاصيل الهندسية والحل المنفّذ |
| :--- | :--- | :--- | :--- |
| **ARCH-11** | **انقسام نسخ React في Vite dev cache وخطأ `Invalid hook call` (`useState` of null)** | 🟢 **محلول (Resolved)** | تم توحيد مسارات `react` و `react-dom` في `vite.config.ts` عبر `resolve.alias` و `dedupe`، وإدراج كافة الحزم الخارجية (`zustand`, `motion/react`, `recharts`, `exceljs`, `xlsx`, `hyperformula`, `react-window`, `zod`, إلخ) في `optimizeDeps.include`، وتحويل استيرادات الواجهات في `src/presentation/router/AppRouter.tsx` من `React.lazy` إلى استيرادات ثابتة مباشرة (Static Imports) لمنع إعادة التجميع المتأخرة أثناء التشغيل. |
| **ARCH-09** | **ازدواجية بعض الملفات القديمة والمهجورة في الشجرة (`app/applet/...` و `mobile/...`)** | 🟡 **جزئي (Partial / In-Progress)** | يعتمد التطبيق الفعلي بالكامل على المسار الموحد `src/`، بينما لا تزال بعض المجلدات الأرشيفية القديمة (`app/applet/` و `mobile/` الجذري) موجودة في المستودع وتحتاج إلى تنظيف تدريجي لضمان عدم الالتباس. |
| **SEC-01** | **حماية نقاط نهاية `/api/gmao/*` وترويسات الأمان** | 🟢 **محلول (Resolved)** | تم تطبيق ترويسات `CSP`، وتحديد معدل الطلبات (Rate Limiting)، والتحقق من الهوية عبر `authenticateApi` في `server.ts`. |

---

## 4. الأداء والاختبارات (Performance & Quality Assurance)

| المعرف | المشكلة المرصودة | الحالة | التفاصيل الهندسية والحل المنفّذ |
| :--- | :--- | :--- | :--- |
| **PERF-03** | **توسيع نطاق التمرير الافتراضي (Virtual Scrolling) للجداول الضخمة** | 🟡 **جزئي (Partial / In-Progress)** | مكون `VirtualizedTable.tsx` و `GmaoIndustrialDataGrid.tsx` مطبقان في الجداول الرئيسية، ويجري العمل على تعميم التمرير الافتراضي ليشمل كافة الجداول الفرعية عند تجاوز 10,000 سجل. |
| **TEST-02** | **توسيع تغطية اختبارات التكامل الشاملة (E2E & Conflict Scenarios)** | 🟡 **جزئي (Partial / In-Progress)** | تتوفر اختبارات الوحدة والتكامل الأساسية في `src/tests/`، مع الحاجة إلى إضافة اختبارات آلية تغطي سيناريوهات `ServerSyncConflictModal` وبروتوكول `MANUAL_SSOT_TEST` الخماسي بشكل مؤتمت. |
| **IOT-01** | **الربط المباشر مع حساسات المصنع الحية (MQTT / OPC-UA)** | 🔴 **مفتوح (Open / Backlog)** | حالياً يتم تحديث العدادات والساعات يدوياً أو عبر استيراد Excel؛ الربط المباشر مع بروتوكولات المصنع الحية مدرج ضمن خارطة الطريق المستقبلية. |
