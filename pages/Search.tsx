import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Beneficiary, Employee, Operation, AssistanceType } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Pagination } from '../components/Pagination';

type SortDirection = 'asc' | 'desc';
type BeneficiarySortKey = keyof Beneficiary | 'employeeName';
type OperationSortKey = keyof Operation | 'assistanceName' | 'amount';

interface BeneficiarySortConfig {
    key: BeneficiarySortKey | null;
    direction: SortDirection;
}

interface OperationSortConfig {
    key: OperationSortKey | null;
    direction: SortDirection;
}

interface SearchPageProps {
    beneficiaries: Beneficiary[];
    employees: Employee[];
    operations: Operation[];
    assistanceTypes: AssistanceType[];
}

export const SearchPage: React.FC<SearchPageProps> = ({ beneficiaries, employees, operations, assistanceTypes }) => {
    const [searchType, setSearchType] = useState<'beneficiary' | 'employee'>('beneficiary');
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Beneficiary[]>([]);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [beneficiarySortConfig, setBeneficiarySortConfig] = useState<BeneficiarySortConfig>({ key: 'name', direction: 'asc' });
    const [operationSortConfig, setOperationSortConfig] = useState<OperationSortConfig>({ key: 'date', direction: 'desc' });
    const ITEMS_PER_PAGE = 10;


    const handleSearch = useCallback(() => {
        setSelectedBeneficiary(null);
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }
    
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let filteredResults: Beneficiary[] = [];
    
        if (searchType === 'beneficiary') {
            filteredResults = beneficiaries.filter(b =>
                b.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                b.national_id.includes(lowerCaseSearchTerm) ||
                b.phone.includes(lowerCaseSearchTerm) ||
                b.code.toLowerCase().includes(lowerCaseSearchTerm)
            );
        } else { // employee search
            const matchingEmployees = employees.filter(e =>
                e.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                e.phone.includes(lowerCaseSearchTerm)
            );
            const matchingEmployeeIds = new Set(matchingEmployees.map(e => e.national_id));
            filteredResults = beneficiaries.filter(b => matchingEmployeeIds.has(b.employee_national_id));
        }
    
        setResults(filteredResults);
    
        if (filteredResults.length === 1) {
            setSelectedBeneficiary(filteredResults[0]);
        }
    }, [searchTerm, searchType, beneficiaries, employees]);

    const requestBeneficiarySort = (key: BeneficiarySortKey) => {
        let direction: SortDirection = 'asc';
        if (beneficiarySortConfig.key === key && beneficiarySortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setBeneficiarySortConfig({ key, direction });
    };

    const getBeneficiarySortIcon = (key: BeneficiarySortKey) => {
        if (beneficiarySortConfig.key !== key) return 'fa-sort text-gray-500';
        return beneficiarySortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        if (beneficiarySortConfig.key) {
            sortableItems.sort((a, b) => {
                const getVal = (item: Beneficiary, key: BeneficiarySortKey) => {
                    if (key === 'employeeName') {
                        return employees.find(e => e.national_id === item.employee_national_id)?.name || 'متطوع';
                    }
                    return item[key as keyof Beneficiary];
                };
                const valA = getVal(a, beneficiarySortConfig.key!);
                const valB = getVal(b, beneficiarySortConfig.key!);
                let comparison = 0;
                if (valA > valB) comparison = 1;
                else if (valA < valB) comparison = -1;
                return beneficiarySortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [results, beneficiarySortConfig, employees]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [results]);

    const paginatedResults = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedResults]);

    const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
    
    const requestOperationSort = (key: OperationSortKey) => {
        let direction: SortDirection = 'asc';
        if (operationSortConfig.key === key && operationSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setOperationSortConfig({ key, direction });
    };

    const getOperationSortIcon = (key: OperationSortKey) => {
        if (operationSortConfig.key !== key) return 'fa-sort text-gray-500';
        return operationSortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    const beneficiaryOperations = useMemo(() => {
        if (!selectedBeneficiary) return [];
        let sortableItems = operations.filter(op => op.beneficiary_national_id === selectedBeneficiary.national_id);

        if (operationSortConfig.key) {
             sortableItems.sort((a, b) => {
                const getVal = (item: Operation, key: OperationSortKey) => {
                    if (key === 'assistanceName') {
                        return assistanceTypes.find(at => at.id === item.assistance_id)?.name || '';
                    }
                    return item[key as keyof Operation];
                };
                const valA = getVal(a, operationSortConfig.key!);
                const valB = getVal(b, operationSortConfig.key!);
                let comparison = 0;
                if (valA > valB) comparison = 1;
                else if (valA < valB) comparison = -1;
                return operationSortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [selectedBeneficiary, operations, operationSortConfig, assistanceTypes]);

    const ThBeneficiarySortable: React.FC<{ sortKey: BeneficiarySortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestBeneficiarySort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getBeneficiarySortIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );
    
    const ThOperationSortable: React.FC<{ sortKey: OperationSortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestOperationSort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getOperationSortIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );

    return (
        <div>
            <Header title="بحث" icon="fa-search" />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="mb-2 text-gray-700 dark:text-gray-300">نوع البحث</label>
                        <select
                            value={searchType}
                            onChange={(e) => {
                                setSearchType(e.target.value as 'beneficiary' | 'employee');
                                setResults([]);
                                setSearchTerm('');
                                setSelectedBeneficiary(null);
                            }}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="beneficiary">بحث عن مستفيد (بالاسم/الرقم القومي/المحمول/الكود)</option>
                            <option value="employee">بحث بالموظف المسؤول (بالاسم/المحمول)</option>
                        </select>
                    </div>
                    <div className="flex flex-col md:col-span-1">
                        <label className="mb-2 text-gray-700 dark:text-gray-300">كلمة البحث</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="أدخل كلمة البحث هنا..."
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} icon="fa-search" className="h-12">بحث</Button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">نتائج البحث ({results.length})</h2>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <ThBeneficiarySortable sortKey="code" label="كود المستفيد" />
                            <ThBeneficiarySortable sortKey="name" label="اسم المستفيد" />
                            <ThBeneficiarySortable sortKey="national_id" label="الرقم القومي" />
                            <ThBeneficiarySortable sortKey="phone" label="المحمول" />
                            <ThBeneficiarySortable sortKey="employeeName" label="الموظف المسؤول" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedResults.length > 0 ? paginatedResults.map(ben => {
                             const employee = employees.find(e => e.national_id === ben.employee_national_id);
                             return (
                                <tr 
                                    key={ben.national_id} 
                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${selectedBeneficiary?.national_id === ben.national_id ? 'bg-emerald-100 dark:bg-emerald-900' : ''}`}
                                    onClick={() => setSelectedBeneficiary(ben)}
                                >
                                    <td className="p-3">{ben.code}</td>
                                    <td className="p-3">{ben.name}</td>
                                    <td className="p-3">{ben.national_id}</td>
                                    <td className="p-3">{ben.phone}</td>
                                    <td className="p-3">{employee?.name || 'متطوع'}</td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center p-6 text-gray-500 dark:text-gray-400">
                                    {searchTerm.trim() && results.length === 0 ? 'لا توجد نتائج تطابق بحثك.' : 'يرجى إدخال كلمة بحث والضغط على زر البحث للبدء.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {results.length > 0 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage}
                    totalItems={sortedResults.length}
                />
            )}

            {selectedBeneficiary && (
                <div className="mt-10 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <i className="fas fa-history text-emerald-500 dark:text-emerald-400 mr-3"></i>
                        سجل عمليات المستفيد: {selectedBeneficiary.name}
                    </h2>
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <ThOperationSortable sortKey="code" label="كود العملية" />
                                    <ThOperationSortable sortKey="assistanceName" label="نوع المساعدة" />
                                    <ThOperationSortable sortKey="amount" label="القيمة" />
                                    <ThOperationSortable sortKey="date" label="التاريخ" />
                                    <ThOperationSortable sortKey="spending_entity" label="جهة الإنفاق" />
                                    <ThOperationSortable sortKey="details" label="التفاصيل" />
                                </tr>
                            </thead>
                            <tbody>
                                {beneficiaryOperations.length > 0 ? beneficiaryOperations.map(op => {
                                    const assistance = assistanceTypes.find(a => a.id === op.assistance_id);
                                    return (
                                        <tr key={op.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-3">{op.code}</td>
                                            <td className="p-3">{assistance?.name || 'غير معروف'}</td>
                                            <td className="p-3">{op.amount.toLocaleString('ar-EG')}</td>
                                            <td className="p-3">{op.date}</td>
                                            <td className="p-3">{op.spending_entity}</td>
                                            <td className="p-3">{op.details || '-'}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-gray-500 dark:text-gray-400">
                                            لا توجد عمليات مسجلة لهذا المستفيد.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
