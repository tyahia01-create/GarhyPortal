import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Beneficiary, Employee, Operation, Note } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EGYPT_GOVERNORATES } from '../constants';
import { FileProviderModal } from '../components/FileProviderModal';
import { Pagination } from '../components/Pagination';

declare const XLSX: any;

type SortDirection = 'asc' | 'desc';
type BeneficiarySortKey = keyof Beneficiary | 'operationsCount' | 'employeeName' | 'researchStatus';
interface SortConfig {
    key: BeneficiarySortKey | null;
    direction: SortDirection;
}

type BeneficiaryFormData = Omit<Beneficiary, 'code' | 'notes'>;

interface BeneficiariesPageProps {
    beneficiaries: Beneficiary[];
    setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>>;
    employees: Employee[];
    operations: Operation[];
    showToast: (message: string, type?: 'success' | 'info', copyText?: string) => void;
}

const BeneficiaryForm: React.FC<{
    onSubmit: (beneficiary: BeneficiaryFormData) => void;
    onClose: () => void;
    beneficiaryToEdit: Beneficiary | null;
    employees: Employee[];
    beneficiaries: Beneficiary[];
}> = ({ onSubmit, onClose, beneficiaryToEdit, employees, beneficiaries }) => {
    const [formData, setFormData] = useState<BeneficiaryFormData>({ 
        name: '', national_id: '', join_date: '', phone: '', alternative_phone: '', 
        governorate: '', city: '', area: '', detailed_address: '', job: '', 
        family_members: 1, marital_status: 'أعزب', spouse_name: '', 
        employee_national_id: '', is_blacklisted: false, researcher_receipt_date: '',
        research_submission_date: '', research_result: undefined
    });
    const [cities, setCities] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const validate = (data: BeneficiaryFormData) => {
        const newErrors: { [key: string]: string } = {};
    
        if (!data.name.trim()) newErrors.name = 'الاسم مطلوب.';
        if (!data.national_id.trim()) {
            newErrors.national_id = 'الرقم القومي مطلوب.';
        } else if (!/^(2|3)\d{13}$/.test(data.national_id)) {
            newErrors.national_id = 'الرقم القومي يجب أن يكون 14 رقمًا ويبدأ بـ 2 أو 3.';
        } else if (!beneficiaryToEdit && beneficiaries.some(b => b.national_id === data.national_id)) {
            newErrors.national_id = 'هذا الرقم القومي مسجل بالفعل.';
        }
    
        if (!data.join_date) newErrors.join_date = 'تاريخ الانضمام مطلوب.';
    
        if (!data.phone.trim()) {
            newErrors.phone = 'رقم المحمول مطلوب.';
        } else if (!/^01[0125]\d{8}$/.test(data.phone)) {
            newErrors.phone = 'رقم المحمول يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.';
        }
    
        if (data.alternative_phone && data.alternative_phone.trim() !== '' && !/^01[0125]\d{8}$/.test(data.alternative_phone)) {
            newErrors.alternative_phone = 'رقم المحمول البديل يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.';
        }
    
        if (!data.governorate) newErrors.governorate = 'المحافظة مطلوبة.';
        if (!data.city) newErrors.city = 'المركز مطلوب.';
        if (!data.area.trim()) newErrors.area = 'المنطقة مطلوبة.';
        if (!data.detailed_address.trim()) newErrors.detailed_address = 'العنوان التفصيلي مطلوب.';
        if (!data.job.trim()) newErrors.job = 'الوظيفة مطلوبة.';
        if (data.family_members < 1) newErrors.family_members = 'عدد أفراد الأسرة يجب أن يكون 1 على الأقل.';
        if (!data.marital_status) newErrors.marital_status = 'الحالة الاجتماعية مطلوبة.';
    
        if (data.marital_status === 'متزوج' && !data.spouse_name?.trim()) {
            newErrors.spouse_name = 'اسم الزوج/الزوجة مطلوب.';
        }
    
        if (!data.employee_national_id) {
            newErrors.employee_national_id = 'الموظف المسؤول مطلوب.';
        }
    
        if (data.research_submission_date && !data.research_result) {
            newErrors.research_result = 'نتيجة البحث مطلوبة عند تحديد تاريخ التسليم.';
        }
    
        return newErrors;
    };
    

    useEffect(() => {
        if (beneficiaryToEdit) {
            const { notes, code, ...editableData } = beneficiaryToEdit;
            setFormData(editableData);
            if (beneficiaryToEdit.governorate) {
                const initialCities = EGYPT_GOVERNORATES[beneficiaryToEdit.governorate] || [];
                setCities(initialCities);
            }
        } else {
             setFormData({ name: '', national_id: '', join_date: '', phone: '', alternative_phone: '', governorate: '', city: '', area: '', detailed_address: '', job: '', family_members: 1, marital_status: 'أعزب', spouse_name: '', employee_national_id: '', is_blacklisted: false, researcher_receipt_date: '', research_submission_date: '', research_result: undefined });
             setCities([]);
        }
    }, [beneficiaryToEdit, employees]);

    useEffect(() => {
        if (formData.governorate) {
            setCities(EGYPT_GOVERNORATES[formData.governorate] || []);
        } else {
            setCities([]);
        }
    }, [formData.governorate]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;

        let newFormData = { ...formData };

        if (name === 'governorate') {
            newFormData = { ...newFormData, governorate: value, city: '', employee_national_id: '' };
        } else if (name === 'city') {
            if (value) {
                const localEmployees = employees.filter(emp => !emp.is_frozen && emp.governorate === formData.governorate && emp.city === value);
                let defaultEmployee = 'VOLUNTEER';
                if (localEmployees.length > 0) {
                    defaultEmployee = localEmployees[0].national_id;
                }
                newFormData = { ...newFormData, city: value, employee_national_id: defaultEmployee };
            } else {
                newFormData = { ...newFormData, city: value, employee_national_id: '' };
            }
        } else if (name === 'marital_status') {
            newFormData = { ...newFormData, marital_status: value as Beneficiary['marital_status'], spouse_name: value !== 'متزوج' ? '' : newFormData.spouse_name };
        } else if (type === 'checkbox') {
             newFormData = { ...newFormData, [name]: target.checked };
        } else {
            newFormData = {
                ...newFormData,
                [name]: type === 'number' ? parseInt(value, 10) : value,
            };
            
            // Reset research result if submission date is cleared
            if (name === 'research_submission_date' && !value) {
                newFormData.research_result = undefined;
            }
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            onSubmit(formData);
        }
    };

    const getResearchStatus = () => {
        if (formData.research_submission_date) {
            if (formData.research_result) return formData.research_result;
            return 'بانتظار النتيجة';
        }
        if (formData.researcher_receipt_date) {
            return 'تحت البحث';
        }
        return 'لم يبدأ';
    };
    
    const researchStatus = getResearchStatus();
    
    const statusColorClass = () => {
        if (researchStatus === 'مقبول') return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200';
        if (researchStatus === 'مرفوض') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
        if (researchStatus === 'تحت البحث') return 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200';
        if (researchStatus === 'لم يبدأ') return 'text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-300';
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>الاسم</label>
                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" className={inputClasses}/>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="national_id" className={labelClasses}>الرقم القومي</label>
                    <input id="national_id" type="text" name="national_id" value={formData.national_id} onChange={handleChange} placeholder="14 رقمًا" className={inputClasses} disabled={!!beneficiaryToEdit} />
                    {errors.national_id && <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>}
                </div>
                <div>
                    <label htmlFor="join_date" className={labelClasses}>تاريخ الانضمام</label>
                    <input id="join_date" type="date" name="join_date" value={formData.join_date} onChange={handleChange} className={inputClasses}/>
                    {errors.join_date && <p className="text-red-500 text-sm mt-1">{errors.join_date}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className={labelClasses}>رقم المحمول</label>
                    <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="11 رقمًا" className={inputClasses}/>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                 <div>
                    <label htmlFor="alternative_phone" className={labelClasses}>رقم هاتف بديل (اختياري)</label>
                    <input id="alternative_phone" type="text" name="alternative_phone" value={formData.alternative_phone || ''} onChange={handleChange} placeholder="11 رقمًا" className={inputClasses}/>
                    {errors.alternative_phone && <p className="text-red-500 text-sm mt-1">{errors.alternative_phone}</p>}
                </div>
                <div>
                    <label htmlFor="governorate" className={labelClasses}>المحافظة</label>
                    <select id="governorate" name="governorate" value={formData.governorate} onChange={handleChange} className={inputClasses}>
                        <option value="">اختر المحافظة</option>
                        {Object.keys(EGYPT_GOVERNORATES).map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                    {errors.governorate && <p className="text-red-500 text-sm mt-1">{errors.governorate}</p>}
                </div>
                <div>
                    <label htmlFor="city" className={labelClasses}>المركز</label>
                    <select id="city" name="city" value={formData.city} onChange={handleChange} className={inputClasses} disabled={!formData.governorate}>
                        <option value="">اختر المركز</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                    <label htmlFor="area" className={labelClasses}>المنطقة</label>
                    <input id="area" type="text" name="area" value={formData.area} onChange={handleChange} placeholder="اسم الشارع / القرية" className={inputClasses}/>
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="detailed_address" className={labelClasses}>العنوان التفصيلي</label>
                    <textarea id="detailed_address" name="detailed_address" value={formData.detailed_address} onChange={handleChange} placeholder="اكتب العنوان بالتفصيل..." rows={2} className={inputClasses}/>
                    {errors.detailed_address && <p className="text-red-500 text-sm mt-1">{errors.detailed_address}</p>}
                </div>

                <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">بيانات البحث الميداني</h3>
                        <div className={`px-4 py-1 rounded-full font-bold text-sm shadow-sm ${statusColorClass()}`}>
                             حالة البحث: {researchStatus}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="researcher_receipt_date" className={labelClasses}>تاريخ استلام الباحث للحالة</label>
                            <input id="researcher_receipt_date" type="date" name="researcher_receipt_date" value={formData.researcher_receipt_date || ''} onChange={handleChange} className={inputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="research_submission_date" className={labelClasses}>تاريخ تسليم الباحث للبحث</label>
                            <input id="research_submission_date" type="date" name="research_submission_date" value={formData.research_submission_date || ''} onChange={handleChange} className={inputClasses}/>
                        </div>
                        {formData.research_submission_date && (
                            <div className="md:col-span-2 animate-fade-in-right">
                                <label htmlFor="research_result" className={labelClasses}>نتيجة البحث</label>
                                <select 
                                    id="research_result" 
                                    name="research_result" 
                                    value={formData.research_result || ''} 
                                    onChange={handleChange} 
                                    className={inputClasses}
                                >
                                    <option value="">اختر النتيجة</option>
                                    <option value="مقبول">مقبول</option>
                                    <option value="مرفوض">مرفوض</option>
                                </select>
                                {errors.research_result && <p className="text-red-500 text-sm mt-1">{errors.research_result}</p>}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="job" className={labelClasses}>الوظيفة</label>
                    <input id="job" type="text" name="job" value={formData.job} onChange={handleChange} placeholder="الوظيفة الحالية" className={inputClasses}/>
                    {errors.job && <p className="text-red-500 text-sm mt-1">{errors.job}</p>}
                </div>
                <div>
                    <label htmlFor="family_members" className={labelClasses}>عدد أفراد الأسرة</label>
                    <input id="family_members" type="number" name="family_members" min="1" value={formData.family_members} onChange={handleChange} placeholder="1" className={inputClasses}/>
                    {errors.family_members && <p className="text-red-500 text-sm mt-1">{errors.family_members}</p>}
                </div>
                <div>
                    <label htmlFor="marital_status" className={labelClasses}>الحالة الاجتماعية</label>
                    <select id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputClasses}>
                        <option value="أعزب">أعزب</option>
                        <option value="متزوج">متزوج</option>
                        <option value="مطلق">مطلق</option>
                        <option value="أرمل">أرمل</option>
                    </select>
                    {errors.marital_status && <p className="text-red-500 text-sm mt-1">{errors.marital_status}</p>}
                </div>
                {formData.marital_status === 'متزوج' && (
                    <div className="animate-fade-in-right">
                        <label htmlFor="spouse_name" className={labelClasses}>اسم الزوج/الزوجة</label>
                        <input id="spouse_name" type="text" name="spouse_name" value={formData.spouse_name || ''} onChange={handleChange} placeholder="الاسم الكامل للزوج/الزوجة" className={inputClasses}/>
                        {errors.spouse_name && <p className="text-red-500 text-sm mt-1">{errors.spouse_name}</p>}
                    </div>
                )}
                 <div className="md:col-span-2">
                    <label htmlFor="employee_national_id" className={labelClasses}>الموظف المسؤول</label>
                    <select id="employee_national_id" name="employee_national_id" value={formData.employee_national_id} onChange={handleChange} className={inputClasses} disabled={!formData.city}>
                         <option value="">
                            {!formData.city ? 'اختر المحافظة والمركز أولاً' : 'اختر الموظف المسؤول أو متطوع'}
                        </option>
                        {employees.filter(e => !e.is_frozen).map(emp => <option key={emp.national_id} value={emp.national_id}>{emp.name}</option>)}
                        <option value="VOLUNTEER">متطوع</option>
                    </select>
                    {errors.employee_national_id && <p className="text-red-500 text-sm mt-1">{errors.employee_national_id}</p>}
                </div>
                 <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                    <label htmlFor="is_blacklisted" className="font-bold text-red-600 dark:text-red-400">
                        <i className="fas fa-ban mr-2"></i>
                        إضافة إلى القائمة السوداء
                    </label>
                    <input 
                        id="is_blacklisted" 
                        type="checkbox" 
                        name="is_blacklisted"
                        checked={!!formData.is_blacklisted}
                        onChange={handleChange}
                        className="form-checkbox h-6 w-6 text-red-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 cursor-pointer"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">{beneficiaryToEdit ? 'تعديل' : 'إضافة'}</Button>
            </div>
        </form>
    );
};


const NotesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    beneficiary: Beneficiary | null;
    onAddNote: (noteText: string) => void;
}> = ({ isOpen, onClose, beneficiary, onAddNote }) => {
    const [newNoteText, setNewNoteText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddNote(newNoteText);
        setNewNoteText('');
    };

    const sortedNotes = useMemo(() => {
        return beneficiary?.notes?.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
    }, [beneficiary]);


    if (!isOpen || !beneficiary) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`ملاحظات المستفيد: ${beneficiary.name}`}>
            <div className="mb-4 max-h-60 overflow-y-auto space-y-2 pr-2">
                {sortedNotes.length > 0 ? (
                    sortedNotes.map((note, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-left mt-1">{new Date(note.date).toLocaleString('ar-EG')}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد ملاحظات مسجلة.</p>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إضافة ملاحظة جديدة</label>
                <textarea
                    id="newNote"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="اكتب ملاحظتك هنا..."
                    rows={3}
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    required
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary">إضافة ملاحظة</Button>
                </div>
            </form>
        </Modal>
    );
};

const BeneficiaryDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onEdit: (beneficiary: Beneficiary) => void;
    beneficiary: Beneficiary | null;
    operationsCount: number;
    totalAmount: number;
    employeeName: string;
}> = ({ isOpen, onClose, onEdit, beneficiary, operationsCount, totalAmount, employeeName }) => {
    if (!isOpen || !beneficiary) return null;
    
    let researchStatus = 'لم يبدأ';
    if (beneficiary.research_submission_date) {
        researchStatus = beneficiary.research_result ? `تم البحث (${beneficiary.research_result})` : 'تم البحث';
    } else if (beneficiary.researcher_receipt_date) {
        researchStatus = 'تحت البحث';
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تفاصيل المستفيد: ${beneficiary.name}`}>
            <div className="space-y-4">
                 {beneficiary.is_blacklisted && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold p-3 rounded-lg text-center border border-red-300 dark:border-red-700">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        هذا المستفيد في القائمة السوداء
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div><strong>كود المستفيد:</strong> {beneficiary.code}</div>
                    <div><strong>الرقم القومي:</strong> {beneficiary.national_id}</div>
                    <div><strong>تاريخ الانضمام:</strong> {beneficiary.join_date}</div>
                    <div><strong>رقم المحمول:</strong> {beneficiary.phone}</div>
                    <div><strong>هاتف بديل:</strong> {beneficiary.alternative_phone || 'لا يوجد'}</div>
                    <div><strong>الوظيفة:</strong> {beneficiary.job}</div>
                    <div><strong>الحالة الاجتماعية:</strong> {beneficiary.marital_status}</div>
                    {beneficiary.marital_status === 'متزوج' && beneficiary.spouse_name && <div><strong>اسم الزوج/الزوجة:</strong> {beneficiary.spouse_name}</div>}
                    <div><strong>عدد أفراد الأسرة:</strong> {beneficiary.family_members}</div>
                    <div className="md:col-span-2"><strong>المحافظة:</strong> {beneficiary.governorate}</div>
                    <div className="md:col-span-2"><strong>المركز:</strong> {beneficiary.city}</div>
                    <div className="md:col-span-2"><strong>المنطقة:</strong> {beneficiary.area}</div>
                    <div className="md:col-span-2"><strong>العنوان التفصيلي:</strong> {beneficiary.detailed_address}</div>
                    <div className="md:col-span-2"><strong>الموظف المسؤول:</strong> {employeeName}</div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-2">بيانات البحث الميداني</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div><strong>تاريخ استلام الباحث:</strong> {beneficiary.researcher_receipt_date || 'لم يحدد'}</div>
                        <div><strong>تاريخ تسليم البحث:</strong> {beneficiary.research_submission_date || 'لم يحدد'}</div>
                        <div><strong>حالة البحث:</strong> {researchStatus}</div>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-emerald-100 dark:bg-emerald-800 p-4 rounded-lg">
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">عدد المساعدات</p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-white">{operationsCount}</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-800 p-4 rounded-lg">
                        <p className="text-sm text-purple-800 dark:text-purple-200">إجمالي قيمة المساعدات</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-white">{totalAmount.toLocaleString('ar-EG')} جنيه</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse pt-6">
                <Button type="button" variant="secondary" onClick={onClose}>إغلاق</Button>
                <Button type="button" variant="primary" icon="fa-edit" onClick={() => onEdit(beneficiary)}>تعديل البيانات</Button>
            </div>
        </Modal>
    );
};

const EmployeeDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}> = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تفاصيل الموظف: ${employee.name}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div><strong>الرقم القومي:</strong> {employee.national_id}</div>
                    <div><strong>رقم المحمول:</strong> {employee.phone}</div>
                    <div><strong>المحافظة:</strong> {employee.governorate}</div>
                    <div><strong>المركز:</strong> {employee.city}</div>
                    <div className="md:col-span-2"><strong>المنطقة:</strong> {employee.area}</div>
                </div>
            </div>
            <div className="flex justify-end pt-6">
                <Button type="button" variant="secondary" onClick={onClose}>إغلاق</Button>
            </div>
        </Modal>
    );
};

export const BeneficiariesPage: React.FC<BeneficiariesPageProps> = ({ beneficiaries, setBeneficiaries, employees, operations, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEmployeeDetailsModalOpen, setIsEmployeeDetailsModalOpen] = useState(false);
    const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<Beneficiary | null>(null);
    const [selectedBeneficiaryForNotes, setSelectedBeneficiaryForNotes] = useState<Beneficiary | null>(null);
    const [selectedBeneficiaryForDetails, setSelectedBeneficiaryForDetails] = useState<Beneficiary | null>(null);
    const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);
    const [filterGovernorate, setFilterGovernorate] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterCities, setFilterCities] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const ITEMS_PER_PAGE = 10;
    
    const inputFilterClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelFilterClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";


    const operationCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        operations.forEach(op => {
            if (op.status === 'مقبوله') {
                counts[op.beneficiary_national_id] = (counts[op.beneficiary_national_id] || 0) + 1;
            }
        });
        return counts;
    }, [operations]);
    
    const detailsModalData = useMemo(() => {
        if (!selectedBeneficiaryForDetails) {
            return { totalAmount: 0, employeeName: '' };
        }

        const totalAmount = operations
            .filter(op => 
                op.beneficiary_national_id === selectedBeneficiaryForDetails.national_id &&
                op.status === 'مقبوله' &&
                op.disbursement_status === 'تم الصرف'
            )
            .reduce((sum, op) => sum + op.amount, 0);
        
        const employeeName = selectedBeneficiaryForDetails.employee_national_id === 'VOLUNTEER'
            ? 'متطوع'
            : employees.find(e => e.national_id === selectedBeneficiaryForDetails.employee_national_id)?.name || 'غير معروف';

        return { totalAmount, employeeName };
    }, [selectedBeneficiaryForDetails, operations, employees]);


    const handleGovernorateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const gov = e.target.value;
        setFilterGovernorate(gov);
        setFilterCity('');
        if (gov) {
            setFilterCities(EGYPT_GOVERNORATES[gov] || []);
        } else {
            setFilterCities([]);
        }
    };

    const handleCityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterCity(e.target.value);
    };

    const filteredBeneficiaries = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

        return beneficiaries.filter(ben => {
            const governorateMatch = !filterGovernorate || ben.governorate === filterGovernorate;
            const cityMatch = !filterCity || ben.city === filterCity;
            
            const searchMatch = !lowercasedSearchTerm || (
                ben.name.toLowerCase().includes(lowercasedSearchTerm) ||
                ben.national_id.includes(lowercasedSearchTerm) ||
                ben.phone.includes(lowercasedSearchTerm) ||
                ben.code.toLowerCase().includes(lowercasedSearchTerm)
            );
            
            const dateMatch = (!filterStartDate || ben.join_date >= filterStartDate) && (!filterEndDate || ben.join_date <= filterEndDate);

            return governorateMatch && cityMatch && searchMatch && dateMatch;
        });
    }, [beneficiaries, filterGovernorate, filterCity, searchTerm, filterStartDate, filterEndDate]);

    const sortedBeneficiaries = useMemo(() => {
        let sortableItems = [...filteredBeneficiaries];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const getSortableValue = (beneficiary: Beneficiary, key: BeneficiarySortKey) => {
                    if (key === 'operationsCount') {
                        return operationCounts[beneficiary.national_id] || 0;
                    }
                    if (key === 'employeeName') {
                         return beneficiary.employee_national_id === 'VOLUNTEER'
                            ? 'متطوع'
                            : employees.find(e => e.national_id === beneficiary.employee_national_id)?.name || 'غير معروف';
                    }
                    if (key === 'researchStatus') {
                        if (beneficiary.research_submission_date) return 2; // 'تم البحث' or 'مقبول/مرفوض'
                        if (beneficiary.researcher_receipt_date) return 1; // 'تحت البحث'
                        return 0; // 'لم يبدأ'
                    }
                    return beneficiary[key as keyof Beneficiary];
                }

                const valA = getSortableValue(a, sortConfig.key!);
                const valB = getSortableValue(b, sortConfig.key!);

                let comparison = 0;
                if (valA === null || valA === undefined) comparison = 1;
                else if (valB === null || valB === undefined) comparison = -1;
                else if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB, 'ar');
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [filteredBeneficiaries, sortConfig, operationCounts, employees]);

    const requestSort = (key: BeneficiarySortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionIcon = (key: BeneficiarySortKey) => {
         if (sortConfig.key !== key) {
            return 'fa-sort text-gray-500';
         }
         return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };


    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [filterGovernorate, filterCity, searchTerm, filterStartDate, filterEndDate, sortConfig]);

    const paginatedBeneficiaries = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedBeneficiaries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedBeneficiaries]);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = paginatedBeneficiaries.filter(ben => selectedIds.has(ben.national_id)).length;
            headerCheckboxRef.current.checked = numSelected === paginatedBeneficiaries.length && paginatedBeneficiaries.length > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < paginatedBeneficiaries.length;
        }
    }, [selectedIds, paginatedBeneficiaries]);

    const totalPages = Math.ceil(sortedBeneficiaries.length / ITEMS_PER_PAGE);


    const executeLocalExport = () => {
        if (filteredBeneficiaries.length === 0) {
            alert('لا توجد بيانات لتصديرها.');
            return;
        }

        const dataToExport = filteredBeneficiaries.map(ben => {
            const count = operationCounts[ben.national_id] || 0;
            const employeeName = ben.employee_national_id === 'VOLUNTEER'
                ? 'متطوع'
                : employees.find(e => e.national_id === ben.employee_national_id)?.name || 'غير معروف';
            
            let researchStatus = 'لم يبدأ';
            if (ben.research_submission_date) {
                researchStatus = ben.research_result || 'تم البحث';
            } else if (ben.researcher_receipt_date) {
                researchStatus = 'تحت البحث';
            }

            return {
                'كود المستفيد': ben.code,
                'الاسم': ben.name,
                'الرقم القومي': ben.national_id,
                'تاريخ الانضمام': ben.join_date,
                'رقم المحمول': ben.phone,
                'رقم هاتف بديل': ben.alternative_phone || '',
                'المحافظة': ben.governorate,
                'المركز': ben.city,
                'المنطقة': ben.area,
                'العنوان التفصيلي': ben.detailed_address,
                'الوظيفة': ben.job,
                'الحالة الاجتماعية': ben.marital_status,
                'اسم الزوج/الزوجة': ben.spouse_name || '',
                'عدد أفراد الأسرة': ben.family_members,
                'تاريخ استلام الباحث للحالة': ben.researcher_receipt_date || '',
                'تاريخ تسليم الباحث للبحث': ben.research_submission_date || '',
                'حالة البحث': researchStatus,
                'عدد المساعدات': count,
                'الموظف المسؤول': employeeName,
                'الملاحظات': ben.notes?.map(note => `${new Date(note.date).toLocaleDateString('ar-EG')}: ${note.text}`).join('\n') || ''
            };
        });

        try {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "المستفيدين");
            const filename = `قائمة_المستفيدين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, filename);
            showToast('بدأ تنزيل ملف المستفيدين.', 'success', filename);
        } catch (error) {
            console.error("Failed to export filtered beneficiaries", error);
            alert("حدث خطأ أثناء تصدير البيانات.");
        }
    };

    const handleProviderSelection = (provider: 'local' | 'google_drive') => {
        if (provider === 'google_drive') {
            alert('خاصية التصدير إلى Google Drive قيد التطوير!');
            setIsProviderModalOpen(false);
            return;
        }
        
        executeLocalExport();
        setTimeout(() => {
            setIsProviderModalOpen(false);
        }, 100);
    };

    const handleAdd = (beneficiary: BeneficiaryFormData) => {
        if (beneficiaries.some(b => b.national_id === beneficiary.national_id)) {
            alert('لا يمكن إضافة مستفيد جديد: الرقم القومي مسجل بالفعل لمستفيد آخر.');
            return;
        }

        const numericCodes = beneficiaries
            .map(b => parseInt(b.code.replace('B', ''), 10))
            .filter(n => !isNaN(n));
        const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
        const newCode = `B${String(maxCode + 1).padStart(3, '0')}`;

        const newBeneficiary: Beneficiary = { ...beneficiary, code: newCode, notes: [] };
        setBeneficiaries(prev => [...prev, newBeneficiary]);
        setIsModalOpen(false);
    };

    const handleEdit = (beneficiaryFormData: BeneficiaryFormData) => {
        setBeneficiaries(prevBeneficiaries => {
            const originalBeneficiary = prevBeneficiaries.find(b => b.national_id === beneficiaryFormData.national_id);
            if (!originalBeneficiary) return prevBeneficiaries;

            let finalCode = originalBeneficiary.code;
            let wasCodeCorrected = false;

            // Check for code validity (format and uniqueness)
            const isCodeFormatInvalid = !/^B\d+$/.test(originalBeneficiary.code || '');
            const isCodeDuplicate = prevBeneficiaries.some(b => b.code === originalBeneficiary.code && b.national_id !== originalBeneficiary.national_id);

            if (isCodeFormatInvalid || isCodeDuplicate) {
                // Generate a new code if invalid
                const numericCodes = prevBeneficiaries
                    .map(b => parseInt(String(b.code).replace('B', ''), 10))
                    .filter(n => !isNaN(n));
                const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
                finalCode = `B${String(maxCode + 1).padStart(3, '0')}`;
                wasCodeCorrected = true;
            }
            
            const updatedBeneficiaries = prevBeneficiaries.map(b => 
                b.national_id === beneficiaryFormData.national_id 
                    ? { ...b, ...beneficiaryFormData, code: finalCode } 
                    : b
            );

            if (wasCodeCorrected) {
                showToast(`تم تصحيح كود المستفيد تلقائيًا إلى ${finalCode}.`, 'info');
            }

            return updatedBeneficiaries;
        });

        setIsModalOpen(false);
        setBeneficiaryToEdit(null);
    };

    const openEditModal = (beneficiary: Beneficiary) => {
        setBeneficiaryToEdit(beneficiary);
        setIsModalOpen(true);
    };

    const openDetailsModal = (beneficiary: Beneficiary) => {
        setSelectedBeneficiaryForDetails(beneficiary);
        setIsDetailsModalOpen(true);
    };

    const openEmployeeDetailsModal = (employeeId: string) => {
        if (employeeId === 'VOLUNTEER') return;
        const employee = employees.find(e => e.national_id === employeeId);
        if (employee) {
            setSelectedEmployeeForDetails(employee);
            setIsEmployeeDetailsModalOpen(true);
        }
    };

    const handleEditFromDetails = (beneficiary: Beneficiary) => {
        setIsDetailsModalOpen(false);
        openEditModal(beneficiary);
    };
    
    const openNotesModal = (beneficiary: Beneficiary) => {
        setSelectedBeneficiaryForNotes(beneficiary);
        setIsNotesModalOpen(true);
    };

    const handleAddNote = (noteText: string) => {
        if (!noteText.trim() || !selectedBeneficiaryForNotes) return;
    
        const newNote: Note = {
            text: noteText,
            date: new Date().toISOString(),
        };
    
        const updateBeneficiary = (ben: Beneficiary) => {
             if (ben.national_id === selectedBeneficiaryForNotes.national_id) {
                const updatedNotes = [...(ben.notes || []), newNote];
                return { ...ben, notes: updatedNotes };
            }
            return ben;
        }

        setBeneficiaries(prev => prev.map(updateBeneficiary));
        setSelectedBeneficiaryForNotes(prev => prev ? updateBeneficiary(prev) : null);
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(paginatedBeneficiaries.map(ben => ben.national_id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleBulkBlacklist = (blacklist: boolean) => {
        if (window.confirm(`هل أنت متأكد من ${blacklist ? 'إضافة' : 'إزالة'} ${selectedIds.size} مستفيد(ين) ${blacklist ? 'إلى' : 'من'} القائمة السوداء؟`)) {
            setBeneficiaries(prev => prev.map(ben => selectedIds.has(ben.national_id) ? { ...ben, is_blacklisted: blacklist } : ben));
            setSelectedIds(new Set());
        }
    };

    const ThSortable: React.FC<{ sortKey: BeneficiarySortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getSortDirectionIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );
    

    return (
        <div>
            <Header title="إدارة المستفيدين" icon="fa-user-friends" />
            <div className="mb-6 flex justify-end items-center space-x-2 space-x-reverse h-10">
                {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-4 animate-fade-in-right">
                        <span className="text-lg">{selectedIds.size} تم تحديده</span>
                        <Button icon="fa-user-slash" variant='danger' onClick={() => handleBulkBlacklist(true)}>إضافة للقائمة السوداء</Button>
                        <Button icon="fa-user-check" variant='primary' onClick={() => handleBulkBlacklist(false)}>إزالة من القائمة السوداء</Button>
                    </div>
                ) : (
                    <>
                        <Button 
                            icon="fa-file-export" 
                            variant="secondary" 
                            onClick={() => setIsProviderModalOpen(true)}
                            disabled={filteredBeneficiaries.length === 0}
                            title="تصدير القائمة الحالية إلى Excel"
                        >
                            تصدير القائمة الحالية
                        </Button>
                        <Button icon="fa-plus" onClick={() => { setBeneficiaryToEdit(null); setIsModalOpen(true); }}>إضافة مستفيد جديد</Button>
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md my-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="govFilter" className={labelFilterClasses}>فلترة حسب المحافظة</label>
                        <select
                            id="govFilter"
                            value={filterGovernorate}
                            onChange={handleGovernorateFilterChange}
                            className={inputFilterClasses}
                        >
                            <option value="">كل المحافظات</option>
                            {Object.keys(EGYPT_GOVERNORATES).map(gov => <option key={gov} value={gov}>{gov}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cityFilter" className={labelFilterClasses}>فلترة حسب المركز</label>
                        <select
                            id="cityFilter"
                            value={filterCity}
                            onChange={handleCityFilterChange}
                            disabled={!filterGovernorate}
                            className={`${inputFilterClasses} disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                        >
                            <option value="">كل المراكز</option>
                            {filterCities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="searchFilter" className={labelFilterClasses}>بحث بالاسم/الرقم القومي/الكود</label>
                        <input
                            id="searchFilter"
                            type="text"
                            placeholder="ابحث هنا..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputFilterClasses}
                        />
                    </div>
                     <div>
                        <label htmlFor="startDateFilter" className={labelFilterClasses}>من تاريخ انضمام</label>
                        <input
                            id="startDateFilter"
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className={inputFilterClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDateFilter" className={labelFilterClasses}>إلى تاريخ انضمام</label>
                        <input
                            id="endDateFilter"
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className={inputFilterClasses}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-center w-12">
                                <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                            </th>
                            <ThSortable sortKey="code" label="كود المستفيد" />
                            <ThSortable sortKey="name" label="الاسم" />
                            <ThSortable sortKey="researchStatus" label="حالة البحث" />
                            <th className="p-3 font-semibold text-gray-700 dark:text-gray-300 text-right">المحمول</th>
                            <th className="p-3 text-right">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBeneficiaries.map(ben => {
                            const noteCount = ben.notes?.length || 0;
                            const count = operationCounts[ben.national_id] || 0;
                            
                            let researchStatusLabel = 'لم يبدأ';
                            let researchStatusClass = 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300';

                            if (ben.research_submission_date) {
                                if (ben.research_result === 'مقبول') {
                                    researchStatusLabel = 'مقبول';
                                    researchStatusClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
                                } else if (ben.research_result === 'مرفوض') {
                                    researchStatusLabel = 'مرفوض';
                                    researchStatusClass = 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
                                } else {
                                    researchStatusLabel = 'تم البحث';
                                    researchStatusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
                                }
                            } else if (ben.researcher_receipt_date) {
                                researchStatusLabel = 'تحت البحث';
                                researchStatusClass = 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
                            }

                            return (
                                <tr key={ben.national_id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                                    selectedIds.has(ben.national_id) ? 'bg-emerald-50 dark:bg-emerald-900/50' :
                                    ben.is_blacklisted 
                                        ? 'bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800/60 text-red-800 dark:text-gray-400' 
                                        : `hover:bg-gray-50 dark:hover:bg-gray-700/50 ${count >= 3 ? 'bg-amber-50 dark:bg-amber-900/50' : ''}`
                                }`}>
                                     <td className="p-3 text-center">
                                        <input type="checkbox" checked={selectedIds.has(ben.national_id)} onChange={() => handleSelect(ben.national_id)} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                                    </td>
                                    <td className="p-3 text-right">{ben.code}</td>
                                    <td className={`p-3 text-right cursor-pointer ${ben.is_blacklisted ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300'}`} onClick={() => openDetailsModal(ben)}>
                                        {ben.is_blacklisted && <i className="fas fa-ban ml-2" title="في القائمة السوداء"></i>}
                                        {ben.name}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${researchStatusClass}`}>
                                            {researchStatusLabel}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">{ben.phone}</td>
                                    <td className="p-3 flex justify-end space-x-2 space-x-reverse">
                                        <Button variant="secondary" onClick={() => openEditModal(ben)} title="تعديل"><i className="fas fa-edit"></i></Button>
                                        <Button variant="secondary" onClick={() => openNotesModal(ben)} title="الملاحظات" className="relative">
                                            <i className="fas fa-comment-dots"></i>
                                            {noteCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-800">
                                                    {noteCount}
                                                </span>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {paginatedBeneficiaries.length === 0 && sortedBeneficiaries.length > 0 && (
                     <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات في هذه الصفحة.
                    </div>
                )}
                 {sortedBeneficiaries.length === 0 && (
                    <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات تطابق معايير البحث الحالية.
                    </div>
                )}
            </div>
            
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage}
                totalItems={sortedBeneficiaries.length} 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={beneficiaryToEdit ? 'تعديل مستفيد' : 'إضافة مستفيد جديد'}>
                <BeneficiaryForm 
                    onSubmit={(formData) => {
                        if (beneficiaryToEdit) {
                            handleEdit(formData);
                        } else {
                            handleAdd(formData);
                        }
                    }} 
                    onClose={() => setIsModalOpen(false)} 
                    beneficiaryToEdit={beneficiaryToEdit} 
                    employees={employees} 
                    beneficiaries={beneficiaries}
                />
            </Modal>
             <NotesModal 
                isOpen={isNotesModalOpen}
                onClose={() => setIsNotesModalOpen(false)}
                beneficiary={selectedBeneficiaryForNotes}
                onAddNote={handleAddNote}
            />
            <BeneficiaryDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onEdit={handleEditFromDetails}
                beneficiary={selectedBeneficiaryForDetails}
                operationsCount={selectedBeneficiaryForDetails ? (operationCounts[selectedBeneficiaryForDetails.national_id] || 0) : 0}
                totalAmount={detailsModalData.totalAmount}
                employeeName={detailsModalData.employeeName}
            />
            <EmployeeDetailsModal
                isOpen={isEmployeeDetailsModalOpen}
                onClose={() => setIsEmployeeDetailsModalOpen(false)}
                employee={selectedEmployeeForDetails}
            />
             <FileProviderModal
                isOpen={isProviderModalOpen}
                onClose={() => setIsProviderModalOpen(false)}
                onSelectProvider={handleProviderSelection}
                title="اختر مكان تصدير الملف"
            />
        </div>
    );
};