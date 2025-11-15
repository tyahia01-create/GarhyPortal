import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { AssistanceType } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';

type SortDirection = 'asc' | 'desc';
type AssistanceSortKey = keyof AssistanceType;
interface SortConfig {
    key: AssistanceSortKey | null;
    direction: SortDirection;
}

interface AssistancePageProps {
    assistanceTypes: AssistanceType[];
    setAssistanceTypes: React.Dispatch<React.SetStateAction<AssistanceType[]>>;
}

const AssistanceForm: React.FC<{
    onSubmit: (assistance: { name: string }) => void;
    onClose: () => void;
    assistanceToEdit: AssistanceType | null;
}> = ({ onSubmit, onClose, assistanceToEdit }) => {
    const [name, setName] = useState(assistanceToEdit?.name || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('اسم المساعدة مطلوب.');
            return;
        }
        setError('');
        onSubmit({ name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسم المساعدة"
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">{assistanceToEdit ? 'تعديل' : 'إضافة'}</Button>
            </div>
        </form>
    );
};

export const AssistancePage: React.FC<AssistancePageProps> = ({ assistanceTypes, setAssistanceTypes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assistanceToEdit, setAssistanceToEdit] = useState<AssistanceType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [selectedIds, setSelectedIds] = useState(new Set<number>());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const ITEMS_PER_PAGE = 10;

    const filteredAssistanceTypes = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedSearchTerm) {
            return assistanceTypes;
        }
        return assistanceTypes.filter(type =>
            type.name.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [assistanceTypes, searchTerm]);
    
    const sortedAssistanceTypes = useMemo(() => {
        let sortableItems = [...filteredAssistanceTypes];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];
                
                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB, 'ar');
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [filteredAssistanceTypes, sortConfig]);

    const requestSort = (key: AssistanceSortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionIcon = (key: AssistanceSortKey) => {
         if (sortConfig.key !== key) {
            return 'fa-sort text-gray-500';
         }
         return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };


    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [searchTerm, sortConfig]);

    const paginatedAssistanceTypes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAssistanceTypes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedAssistanceTypes]);

     useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = paginatedAssistanceTypes.filter(a => selectedIds.has(a.id)).length;
            headerCheckboxRef.current.checked = numSelected === paginatedAssistanceTypes.length && paginatedAssistanceTypes.length > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < paginatedAssistanceTypes.length;
        }
    }, [selectedIds, paginatedAssistanceTypes]);

    const totalPages = Math.ceil(sortedAssistanceTypes.length / ITEMS_PER_PAGE);

    const handleAdd = ({ name }: { name: string }) => {
        const newAssistance = { id: Date.now(), name };
        setAssistanceTypes(prev => [...prev, newAssistance]);
        setIsModalOpen(false);
    };

    const handleEdit = ({ name }: { name: string }) => {
        if (assistanceToEdit) {
            setAssistanceTypes(prev => prev.map(a => a.id === assistanceToEdit.id ? { ...a, name } : a));
        }
        setIsModalOpen(false);
        setAssistanceToEdit(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا النوع من المساعدة؟')) {
            setAssistanceTypes(prev => prev.filter(a => a.id !== id));
        }
    };
    
    const handleBulkDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} نوع (أنواع) من المساعدات؟`)) {
            setAssistanceTypes(prev => prev.filter(a => !selectedIds.has(a.id)));
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id: number) => {
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
            setSelectedIds(new Set(paginatedAssistanceTypes.map(a => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const openEditModal = (assistance: AssistanceType) => {
        setAssistanceToEdit(assistance);
        setIsModalOpen(true);
    };

    const ThSortable: React.FC<{ sortKey: AssistanceSortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getSortDirectionIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );

    return (
        <div>
            <Header title="أنواع المساعدات" icon="fa-box-open" />
             <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="ابحث باسم المساعدة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                 {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-4 animate-fade-in-right">
                        <span className="text-lg">{selectedIds.size} تم تحديده</span>
                        <Button icon="fa-trash" variant='danger' onClick={handleBulkDelete}>حذف المحدد</Button>
                    </div>
                ) : (
                    <Button icon="fa-plus" onClick={() => { setAssistanceToEdit(null); setIsModalOpen(true); }}>إضافة نوع جديد</Button>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-center w-12">
                                <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                            </th>
                            <ThSortable sortKey="id" label="المعرف" />
                            <ThSortable sortKey="name" label="اسم المساعدة" />
                            <th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAssistanceTypes.map(type => (
                            <tr key={type.id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${selectedIds.has(type.id) ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                <td className="p-3 text-center">
                                    <input type="checkbox" checked={selectedIds.has(type.id)} onChange={() => handleSelect(type.id)} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                                </td>
                                <td className="p-3">{type.id}</td>
                                <td className="p-3">{type.name}</td>
                                <td className="p-3 flex space-x-2 space-x-reverse">
                                    <Button variant="secondary" onClick={() => openEditModal(type)}><i className="fas fa-edit"></i></Button>
                                    <Button variant="danger" onClick={() => handleDelete(type.id)}><i className="fas fa-trash"></i></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedAssistanceTypes.length === 0 && sortedAssistanceTypes.length > 0 && (
                     <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات في هذه الصفحة.
                    </div>
                )}
                 {sortedAssistanceTypes.length === 0 && (
                    <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات تطابق معايير البحث الحالية.
                    </div>
                )}
            </div>
             <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage}
                totalItems={sortedAssistanceTypes.length}
            />
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={assistanceToEdit ? 'تعديل نوع مساعدة' : 'إضافة نوع مساعدة'}>
                <AssistanceForm onSubmit={assistanceToEdit ? handleEdit : handleAdd} onClose={() => setIsModalOpen(false)} assistanceToEdit={assistanceToEdit} />
            </Modal>
        </div>
    );
};