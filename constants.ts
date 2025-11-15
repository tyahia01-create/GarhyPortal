import type { Employee, Beneficiary, AssistanceType, Operation, Note, Task } from './types';

export const EGYPT_GOVERNORATES: { [key: string]: string[] } = {
    "القاهرة": ["عين شمس", "السلام", "المرج", "المطرية", "النزهة", "مصر الجديدة", "شرق مدينة نصر", "غرب مدينة نصر", "الوايلي", "باب الشعرية", "وسط القاهرة", "عابدين", "موسكي", "الخليفة", "المقطم", "السيدة زينب", "مصر القديمة", "دار السلام", "البساتين", "المعادي", "حلوان", "التبين", "15 مايو"],
    "الجيزة": ["الجيزة", "العجوزة", "الدقي", "الهرم", "بولاق الدكرور", "العمرانية", "الوراق", "إمبابة", "شمال الجيزة", "جنوب الجيزة", "6 أكتوبر", "الشيخ زايد", "الحوامدية", "البدرشين", "العياط", "أطفيح", "الصف", "أوسيم", "كرداسة", "أبو النمرس", "منشأة القناطر"],
    "الإسكندرية": ["أول المنتزه", "ثاني المنتزه", "شرق", "وسط", "غرب", "الجمرك", "العجمي", "العامرية", "برج العرب"],
    "القليوبية": ["بنها", "قليوب", "شبرا الخيمة", "القناطر الخيرية", "الخانكة", "كفر شكر", "طوخ", "شبين القناطر", "العبور"],
    "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "قطور", "بسيون", "سمنود"],
    "المنوفية": ["شبين الكوم", "منوف", "مدينة السادات", "أشمون", "الباجور", "قويسنا", "بركة السبع", "تلا", "الشهداء"],
    "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو حمص", "حوش عيسى", "الدلنجات", "المحمودية", "الرحمانية", "إيتاي البارود", "شبراخيت", "كوم حمادة", "بدر", "وادي النطرون", "أبو المطامير"],
    "الشرقية": ["الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح", "أبو حماد", "ههيا", "فاقوس", "الإبراهيمية", "ديرب نجم", "كفر صقر", "أولاد صقر", "الحسينية", "صان الحجر القبلية", "منشأة أبو عمر", "القنايات", "مشتول السوق", "أبو كبير"],
    "الدقهلية": ["المنصورة", "طلخا", "ميت غمر", "السنبلاوين", "أجا", "بلقاس", "دكرنس", "المنزلة", "شربين", "المطرية", "الجمالية", "منية النصر", "بني عبيد", "نبروه", "تمي الأمديد"],
    "كفر الشيخ": ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "البرلس", "بلطيم", "الحامول", "بيلا", "الرياض", "سيدي سالم", "قلين"],
    "دمياط": ["دمياط", "دمياط الجديدة", "رأس البر", "فارسكور", "كفر سعد", "الزرو", "كفر البطيخ"],
    "الإسماعيلية": ["الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "أبو صوير", "القصاصين الجديدة", "التل الكبير"],
    "بورسعيد": ["شرق", "الغرب", "المناخ", "الزهور", "الضواحي", "بورفؤاد"],
    "السويس": ["السويس", "الأربعين", "عتاقة", "فيصل", "الجناين"],
    "شمال سيناء": ["العريش", "بئر العبد", "الشيخ زويد", "رفح", "الحسنة", "نخل"],
    "جنوب سيناء": ["الطور", "شرم الشيخ", "دهب", "نويبع", "طابا", "سانت كاترين", "أبو زنيمة", "أبو رديس", "رأس سدر"],
    "الفيوم": ["الفيوم", "إطسا", "سنورس", "طامية", "يوسف الصديق", "أبشواي"],
    "بني سويف": ["بني سويف", "الواسطى", "ناصر", "إهناسيا", "ببا", "سمسطا", "الفشن"],
    "المنيا": ["المنيا", "المنيا الجديدة", "مغاغة", "بني مزار", "مطاي", "سمالوط", "أبو قرقاص", "ملوي", "دير مواس", "العدوة"],
    "أسيوط": ["أسيوط", "ديروط", "القوصية", "منفلوط", "أبنوب", "أبو تيج", "الغنايم", "ساحل سليم", "البداري", "صدفا"],
    "سوهاج": ["سوهاج", "أخميم", "جرجا", "طما", "طهطا", "المراغة", "المنشأة", "البلينا", "دار السلام", "جهينة", "ساقلتة"],
    "قنا": ["قنا", "أبو تشت", "نجع حمادي", "دشنا", "فرشوط", "قفط", "قوص", "نقادة", "الوقف"],
    "الأقصر": ["الأقصر", "القرنة", "أرمنت", "إسنا", "الطود", "الزينية", "البياضية"],
    "أسوان": ["أسوان", "دراو", "كوم أمبو", "نصر النوبة", "إدفو"],
    "البحر الأحمر": ["الغردقة", "رأس غارب", "سفاجا", "القصير", "مرسى علم", "الشلاتين", "حلايب"],
    "الوادي الجديد": ["الخارجة", "باريس", "موط", "الفرافرة", "بلاط"]
};

export const initialEmployees: Employee[] = [
    { name: 'أحمد محمود', national_id: '28501010100111', phone: '01012345678', governorate: 'القاهرة', city: 'مدينة نصر', area: 'الحي السابع', is_frozen: false },
    { name: 'فاطمة علي', national_id: '29002020100222', phone: '01123456789', governorate: 'الجيزة', city: '6 أكتوبر', area: 'الحي المتميز', is_frozen: false },
    { name: 'متطوع', national_id: 'VOLUNTEER', phone: 'N/A', governorate: 'N/A', city: 'N/A', area: 'N/A', is_frozen: false },
];

export const initialBeneficiaries: Beneficiary[] = [
    { code: 'B001', name: 'سارة حسن', national_id: '29503030100333', join_date: '2023-01-15', phone: '01234567890', alternative_phone: '01011112222', governorate: 'القاهرة', city: 'مدينة نصر', area: 'الحي العاشر', detailed_address: 'عمارة 5، شارع 9، بجوار صيدلية العزبي', job: 'ربة منزل', family_members: 4, marital_status: 'متزوج', spouse_name: 'أحمد محمود علي', employee_national_id: '28501010100111', is_blacklisted: false, notes: [{ text: 'تحتاج إلى مساعدة طبية عاجلة للطفل الأصغر.', date: '2023-10-26T10:00:00.000Z' }], researcher_receipt_date: '2023-10-20', research_submission_date: '2023-10-25' },
    { code: 'B002', name: 'محمد عبد الله', national_id: '29204040200444', join_date: '2022-11-20', phone: '01567890123', alternative_phone: '', governorate: 'الجيزة', city: 'الهرم', area: 'شارع فيصل', detailed_address: 'شارع العروبة، منزل 10، الدور 3', job: 'عامل يومية', family_members: 5, marital_status: 'متزوج', spouse_name: 'فاطمة سيد أحمد', employee_national_id: '29002020100222', is_blacklisted: false, notes: [], researcher_receipt_date: '2023-11-01', research_submission_date: '' },
    { code: 'B003', name: 'علي إبراهيم', national_id: '28805050100555', join_date: '2023-05-10', phone: '01098765432', alternative_phone: '01298765432', governorate: 'القاهرة', city: 'المعادي', area: 'دجلة', detailed_address: '15 شارع النصر، أمام محطة المترو', job: 'بدون عمل', family_members: 3, marital_status: 'أرمل', employee_national_id: '28501010100111', is_blacklisted: false, notes: [{ text: 'تم توفير فرصة عمل مؤقتة له الشهر الماضي.', date: '2023-11-15T14:30:00.000Z' }], researcher_receipt_date: '', research_submission_date: '' },
];

export const initialAssistanceTypes: AssistanceType[] = [
    { id: 1, name: 'مساعدة مالية' },
    { id: 2, name: 'مواد غذائية' },
    { id: 3, name: 'علاج طبي' },
];

export const initialOperations: Operation[] = [
    { id: 1, code: 'OP001', beneficiary_national_id: '29503030100333', assistance_id: 1, amount: 500, date: '2023-02-01', committee_number: 'C1', committee_decision_description: 'Approved for monthly aid.', spending_entity: 'تبرعات أهل الخير', details: 'دفعة أولى من مساعدة مالية شهرية.', status: 'مقبوله', acceptance_date: '2023-02-02', disbursement_status: 'تم الصرف', disbursement_date: '2023-02-05' },
    { id: 2, code: 'OP002', beneficiary_national_id: '29204040200444', assistance_id: 2, amount: 300, date: '2023-03-10', committee_number: 'C1', committee_decision_description: 'Standard food package.', spending_entity: 'مؤسسة الجارحي', details: 'كرتونة مواد غذائية لشهر مارس.', status: 'مقبوله', acceptance_date: '2023-03-11', disbursement_status: 'تم الصرف', disbursement_date: '2023-03-12' },
    { id: 3, code: 'OP003', beneficiary_national_id: '29503030100333', assistance_id: 2, amount: 250, date: '2023-04-05', committee_number: 'C2', committee_decision_description: 'Requires further review.', spending_entity: 'مؤسسة الجارحي', details: 'مساعدة غذائية إضافية.', status: 'معلقة', pending_date: '2023-04-06' },
    { id: 4, code: 'OP004', beneficiary_national_id: '29503030100333', assistance_id: 3, amount: 1000, date: '2023-06-15', committee_number: 'C3', committee_decision_description: 'Urgent medical need approved.', spending_entity: 'فاعل خير', details: 'تكاليف عملية جراحية للابن.', status: 'مقبوله', acceptance_date: '2023-06-16', disbursement_status: 'جاري التنفيذ' },
    { id: 5, code: 'OP005', beneficiary_national_id: '29503030100333', assistance_id: 1, amount: 400, date: '2023-08-20', committee_number: 'C4', committee_decision_description: 'Beneficiary did not meet criteria.', spending_entity: 'تبرعات', details: '', status: 'مرفوضه' },
    { id: 6, code: 'OP006', beneficiary_national_id: '28805050100555', assistance_id: 1, amount: 700, date: '2023-09-01', committee_number: 'C5', committee_decision_description: 'Rent assistance approved.', spending_entity: 'مؤسسة الجارحي', details: 'مساعدة إيجار لمدة شهر.', status: 'مقبوله', acceptance_date: '2023-09-01', disbursement_status: 'تم الصرف', disbursement_date: '2023-09-02' },
];

export const initialTasks: Task[] = [
    { id: 1, userId: 1, text: 'متابعة حالة المستفيد محمد عبد الله', isCompleted: false, createdAt: new Date('2023-11-20T10:00:00Z').toISOString(), updatedAt: new Date('2023-11-20T10:00:00Z').toISOString() },
    { id: 2, userId: 1, text: 'التحضير لاجتماع اللجنة الأسبوعي', isCompleted: true, createdAt: new Date('2023-11-18T15:30:00Z').toISOString(), updatedAt: new Date('2023-11-19T09:00:00Z').toISOString() },
    { id: 3, userId: 2, text: 'مراجعة طلبات المساعدات الجديدة', isCompleted: false, createdAt: new Date('2023-11-21T11:00:00Z').toISOString(), updatedAt: new Date('2023-11-21T11:00:00Z').toISOString() },
];