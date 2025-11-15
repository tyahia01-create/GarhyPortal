import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Employee, Beneficiary } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EGYPT_GOVERNORATES } from '../constants';
import { Pagination } from '../components/Pagination';

type SortDirection = 'asc' | 'desc';
type EmployeeSortKey = keyof Employee;
interface SortConfig {
    key: EmployeeSortKey | null;
    direction: SortDirection;
}

interface EmployeesPageProps {
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    beneficiaries: Beneficiary[];
    setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>>;
    updateEmployee: (employee: Employee, originalNationalId: string) => void;
}

const EmployeeForm: React.FC<{
    onSubmit: (employee: Employee) => void;
    onClose: () => void;
    employeeToEdit: Employee | null;
    employees: Employee[];
}> = ({ onSubmit, onClose, employeeToEdit, employees }) => {
    const [formData, setFormData] = useState<Employee>(
        employeeToEdit || { name: '', national_id: '', phone: '', governorate: '', city: '', area: '', is_frozen: false }
    );
    const [cities, setCities] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isInitialNationalIdInvalid, setIsInitialNationalIdInvalid] = useState(false);
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";

    const validate = (data: Employee) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.name.trim()) newErrors.name = 'الاسم مطلوب.';
        
        if (!data.national_id.trim()) {
            newErrors.national_id = 'الرقم القومي مطلوب.';
        } else if (!/^(2|3)\d{13}$/.test(data.national_id)) {
            newErrors.national_id = 'الرقم القومي يجب أن يكون 14 رقمًا ويبدأ بـ 2 أو 3.';
        } else if (
            (!employeeToEdit || (employeeToEdit && data.national_id !== employeeToEdit.national_id)) &&
            employees.some(e => e.national_id === data.national_id)
        ) {
            newErrors.national_id = 'الرقم القومي موجود بالفعل لموظف آخر.';
        }

        if (!data.phone.trim()) {
            newErrors.phone = 'رقم المحمول مطلوب.';
        } else if (!/^01[0125]\d{8}$/.test(data.phone)) {
            newErrors.phone = 'رقم المحمول يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.';
        }
        
        if (!data.governorate) newErrors.governorate = 'المحافظة مطلوبة.';
        if (!data.city) newErrors.city = 'المركز مطلوب.';
        if (!data.area.trim()) newErrors.area = 'المنطقة مطلوبة.';

        return newErrors;
    };

     // Effect to initialize the form when employeeToEdit changes
    useEffect(() => {
        if (employeeToEdit) {
            const isInvalidFormat = !/^(2|3)\d{13}$/.test(employeeToEdit.national_id);
            setIsInitialNationalIdInvalid(isInvalidFormat);
            
            setFormData(employeeToEdit);
            if (employeeToEdit.governorate) {
                setCities(EGYPT_GOVERNORATES[employeeToEdit.governorate] || []);
            } else {
                setCities([]);
            }
        } else {
            // Reset for 'add new' mode
            setIsInitialNationalIdInvalid(false);
            setFormData({ name: '', national_id: '', phone: '', governorate: '', city: '', area: '', is_frozen: false });
            setCities([]);
        }
    }, [employeeToEdit]);

    // Effect for unlocking the form
    useEffect(() => {
        if (isInitialNationalIdInvalid) {
            const isFormatNowValid = /^(2|3)\d{13}$/.test(formData.national_id);
            if (isFormatNowValid) {
                // Unlock the form once the national ID format is correct
                setIsInitialNationalIdInvalid(false);
            }
        }
    }, [formData.national_id, isInitialNationalIdInvalid]);

    // Effect to handle governorate changes by the user
    useEffect(() => {
        if (formData.governorate) {
            setCities(EGYPT_GOVERNORATES[formData.governorate] || []);
        } else {
            setCities([]);
        }
    }, [formData.governorate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'governorate') {
            setFormData(prev => ({ ...prev, governorate: value, city: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isInitialNationalIdInvalid && (
                <div className="p-3 mb-4 text-amber-800 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/50 rounded-lg border border-amber-300 dark:border-amber-600">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <strong>تنبيه:</strong> الرقم القومي الحالي غير صالح. يرجى تصحيحه لتمكين باقي الحقول.
                </div>
            )}
            <div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="الاسم" className={inputClasses} disabled={isInitialNationalIdInvalid}/>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
                <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} placeholder="الرقم القومي" className={inputClasses}/>
                {errors.national_id && <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>}
            </div>
            <div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="رقم المحمول" className={inputClasses} disabled={isInitialNationalIdInvalid}/>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
             <div>
                <select name="governorate" value={formData.governorate} onChange={handleChange} className={inputClasses} disabled={isInitialNationalIdInvalid}>
                    <option value="">اختر المحافظة</option>
                    {Object.keys(EGYPT_GOVERNORATES).map(gov => <option key={gov} value={gov}>{gov}</option>)}
                </select>
                {errors.governorate && <p className="text-red-500 text-sm mt-1">{errors.governorate}</p>}
            </div>
            <div>
                <select name="city" value={formData.city} onChange={handleChange} className={inputClasses} disabled={!formData.governorate || isInitialNationalIdInvalid}>
                    <option value="">اختر المركز</option>
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="المنطقة" className={inputClasses} disabled={isInitialNationalIdInvalid}/>
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">{employeeToEdit ? 'تعديل' : 'إضافة'}</Button>
            </div>
        </form>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmButtonText: string;
    confirmButtonVariant?: 'danger' | 'primary' | 'secondary';
}> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText, confirmButtonVariant = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button type="button" variant={confirmButtonVariant} onClick={onConfirm}>
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


export const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, setEmployees, setBeneficiaries, updateEmployee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [employeeToFreeze, setEmployeeToFreeze] = useState<{ national_id: string; freeze: boolean } | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const ITEMS_PER_PAGE = 10;

    const filteredEmployees = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        const displayableEmployees = employees.filter(emp => emp.national_id !== 'VOLUNTEER');
        
        if (!lowercasedSearchTerm) {
            return displayableEmployees;
        }
        return displayableEmployees.filter(emp =>
            emp.name.toLowerCase().includes(lowercasedSearchTerm) ||
            emp.national_id.includes(lowercasedSearchTerm) ||
            emp.phone.includes(lowercasedSearchTerm)
        );
    }, [employees, searchTerm]);

    const sortedEmployees = useMemo(() => {
        let sortableItems = [...filteredEmployees];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];
                
                let comparison = 0;
                if (valA > valB) {
                    comparison = 1;
                } else if (valA < valB) {
                    comparison = -1;
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [filteredEmployees, sortConfig]);

    const requestSort = (key: EmployeeSortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionIcon = (key: EmployeeSortKey) => {
         if (sortConfig.key !== key) {
            return 'fa-sort text-gray-500';
         }
         return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };


    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [searchTerm, sortConfig]);

    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedEmployees]);
    
     useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = paginatedEmployees.filter(emp => selectedIds.has(emp.national_id)).length;
            headerCheckboxRef.current.checked = numSelected === paginatedEmployees.length && paginatedEmployees.length > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < paginatedEmployees.length;
        }
    }, [selectedIds, paginatedEmployees]);


    const totalPages = Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE);

    const handleAdd = (employee: Employee) => {
        setEmployees(prev => [...prev, employee]);
        setIsModalOpen(false);
    };

    const handleEdit = (employee: Employee) => {
        if (employeeToEdit) {
            updateEmployee(employee, employeeToEdit.national_id);
            if(employee.governorate !== employeeToEdit.governorate || employee.city !== employeeToEdit.city) {
                 setBeneficiaries(prev => prev.map(ben => ben.employee_national_id === employee.national_id ? { ...ben, employee_national_id: employee.national_id } : ben));
            }
        }
        setIsModalOpen(false);
        setEmployeeToEdit(null);
    };

    const handleFreezeToggle = (national_id: string, freeze: boolean) => {
        setEmployeeToFreeze({ national_id, freeze });
        setIsConfirmModalOpen(true);
    };

    const confirmFreezeToggle = () => {
        if (employeeToFreeze) {
            if(employeeToFreeze.freeze) {
                setBeneficiaries(prev =>
                    prev.map(ben =>
                        ben.employee_national_id === employeeToFreeze.national_id
                            ? { ...ben, employee_national_id: 'VOLUNTEER' }
                            : ben
                    )
                );
            }
            setEmployees(prev => prev.map(emp => emp.national_id === employeeToFreeze.national_id ? { ...emp, is_frozen: employeeToFreeze.freeze } : emp));
            
            setIsConfirmModalOpen(false);
            setEmployeeToFreeze(null);
        }
    };
    
    const handleBulkFreeze = (freeze: boolean) => {
         if (window.confirm(`هل أنت متأكد من ${freeze ? 'تجميد' : 'فك تجميد'} ${selectedIds.size} موظف (موظفين)؟`)) {
            if(freeze) {
                setBeneficiaries(prev =>
                    prev.map(ben =>
                        selectedIds.has(ben.employee_national_id)
                            ? { ...ben, employee_national_id: 'VOLUNTEER' }
                            : ben
                    )
                );
            }
            setEmployees(prev => prev.map(emp => selectedIds.has(emp.national_id) ? { ...emp, is_frozen: freeze } : emp));
            setSelectedIds(new Set());
        }
    }

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
            setSelectedIds(new Set(paginatedEmployees.map(emp => emp.national_id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const openEditModal = (employee: Employee) => {
        setEmployeeToEdit(employee);
        setIsModalOpen(true);
    };
    
    const ThSortable: React.FC<{ sortKey: EmployeeSortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getSortDirectionIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );

    return (
        <div>
            <Header title="إدارة الموظفين" icon="fa-users-cog" />
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم/الرقم القومي/المحمول..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-4 animate-fade-in-right">
                        <span className="text-lg">{selectedIds.size} تم تحديده</span>
                        <Button icon="fa-snowflake" variant='secondary' onClick={() => handleBulkFreeze(true)}>تجميد المحدد</Button>
                        <Button icon="fa-sun" variant='primary' onClick={() => handleBulkFreeze(false)}>فك تجميد المحدد</Button>
                    </div>
                ) : (
                    <Button icon="fa-plus" onClick={() => { setEmployeeToEdit(null); setIsModalOpen(true); }}>إضافة موظف جديد</Button>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-center w-12">
                                <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                            </th>
                            <ThSortable sortKey="name" label="الاسم" />
                            <ThSortable sortKey="national_id" label="الرقم القومي" />
                            <ThSortable sortKey="phone" label="المحمول" />
                            <ThSortable sortKey="governorate" label="المحافظة" />
                            <ThSortable sortKey="city" label="المركز" />
                            <ThSortable sortKey="area" label="المنطقة" />
                            <th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map(emp => (
                            <tr key={emp.national_id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${selectedIds.has(emp.national_id) ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} ${emp.is_frozen ? 'opacity-60' : ''}`}>
                                <td className="p-3 text-center">
                                    <input type="checkbox" checked={selectedIds.has(emp.national_id)} onChange={() => handleSelect(emp.national_id)} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                                </td>
                                <td className={`p-3 ${emp.is_frozen ? 'line-through' : ''}`}>{emp.name}</td>
                                <td className="p-3">{emp.national_id}</td>
                                <td className="p-3">{emp.phone}</td>
                                <td className="p-3">{emp.governorate}</td>
                                <td className="p-3">{emp.city}</td>
                                <td className="p-3">{emp.area}</td>
                                <td className="p-3 flex space-x-2 space-x-reverse">
                                    <Button variant="secondary" onClick={() => openEditModal(emp)}><i className="fas fa-edit"></i></Button>
                                    {emp.is_frozen ? (
                                        <Button variant="primary" onClick={() => handleFreezeToggle(emp.national_id, false)} title="فك تجميد"><i className="fas fa-sun"></i></Button>
                                    ) : (
                                        <Button variant="danger" onClick={() => handleFreezeToggle(emp.national_id, true)} title="تجميد"><i className="fas fa-snowflake"></i></Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedEmployees.length === 0 && sortedEmployees.length > 0 && (
                     <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات في هذه الصفحة.
                    </div>
                )}
                {sortedEmployees.length === 0 && (
                    <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات تطابق معايير البحث الحالية.
                    </div>
                )}
            </div>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage}
                totalItems={sortedEmployees.length}
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={employeeToEdit ? 'تعديل موظف' : 'إضافة موظف جديد'}>
                <EmployeeForm onSubmit={employeeToEdit ? handleEdit : handleAdd} onClose={() => setIsModalOpen(false)} employeeToEdit={employeeToEdit} employees={employees} />
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmFreezeToggle}
                title={employeeToFreeze?.freeze ? "تأكيد تجميد الموظف" : "تأكيد فك تجميد الموظف"}
                message={
                    employeeToFreeze?.freeze ? (
                        <>
                            هل أنت متأكد من تجميد هذا الموظف؟
                            <br />
                            <span className="font-bold text-amber-500 dark:text-amber-400">سيتم إعادة تعيين المستفيدين المرتبطين به إلى "متطوع" تلقائيًا.</span>
                        </>
                    ) : "هل أنت متأكد من فك تجميد هذا الموظف؟"
                }
                confirmButtonText={employeeToFreeze?.freeze ? "تجميد" : "فك التجميد"}
                confirmButtonVariant={employeeToFreeze?.freeze ? "danger" : "primary"}
            />
        </div>
    );
};