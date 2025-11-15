import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import type { Employee, Beneficiary, AssistanceType, Operation } from '../types';
import { FileProviderModal } from '../components/FileProviderModal';

// This assumes xlsx is loaded from a CDN in index.html
declare const XLSX: any;

interface ExportPageProps {
    data: {
        employees: Employee[];
        beneficiaries: Beneficiary[];
        assistanceTypes: AssistanceType[];
        operations: Operation[];
    };
    showToast: (message: string, type?: 'success' | 'info', copyText?: string) => void;
}

export const ExportPage: React.FC<ExportPageProps> = ({ data, showToast }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

    const inputClasses = "p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right";


    const executeLocalExport = () => {
        const filteredBeneficiaries = data.beneficiaries.filter(ben => {
            if (!startDate && !endDate) return true;
            const joinDate = ben.join_date;
            const isAfterStart = !startDate || joinDate >= startDate;
            const isBeforeEnd = !endDate || joinDate <= endDate;
            return isAfterStart && isBeforeEnd;
        });

        const filteredOperations = data.operations.filter(op => {
            if (!startDate && !endDate) return true;
            const opDate = op.date;
            const isAfterStart = !startDate || opDate >= startDate;
            const isBeforeEnd = !endDate || opDate <= endDate;
            return isAfterStart && isBeforeEnd;
        });

        const exportableBeneficiaries = filteredBeneficiaries.map(ben => {
            let researchStatus = 'لم يبدأ';
            if (ben.research_submission_date) {
                researchStatus = ben.research_result || 'تم البحث';
            } else if (ben.researcher_receipt_date) {
                researchStatus = 'تحت البحث';
            }
            
            return {
                ...ben,
                'research_status': researchStatus
            }
        });

        const dataToExport = {
            employees: data.employees,
            beneficiaries: exportableBeneficiaries,
            assistanceTypes: data.assistanceTypes,
            operations: filteredOperations,
        };
        
        try {
            const wb = XLSX.utils.book_new();

            const ws_employees = XLSX.utils.json_to_sheet(dataToExport.employees);
            XLSX.utils.book_append_sheet(wb, ws_employees, "الموظفين");

            const ws_beneficiaries = XLSX.utils.json_to_sheet(dataToExport.beneficiaries);
            XLSX.utils.book_append_sheet(wb, ws_beneficiaries, "المستفيدين");

            const ws_assistance = XLSX.utils.json_to_sheet(dataToExport.assistanceTypes);
            XLSX.utils.book_append_sheet(wb, ws_assistance, "أنواع المساعدات");

            const ws_operations = XLSX.utils.json_to_sheet(dataToExport.operations);
            XLSX.utils.book_append_sheet(wb, ws_operations, "العمليات");

            const fileName = `بيانات_مؤسسة_الجارحي_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, fileName);
            showToast('بدأ تنزيل ملف الإكسل الشامل.', 'success', fileName);

        } catch (error) {
            console.error("Failed to export to Excel", error);
            alert("حدث خطأ أثناء تصدير البيانات. تأكد من أن مكتبة XLSX محملة بشكل صحيح.");
        }
    };

    const handleProviderSelection = (provider: 'local' | 'google_drive') => {
        if (provider === 'google_drive') {
            alert('خاصية التصدير إلى Google Drive قيد التطوير!');
            setIsProviderModalOpen(false);
            return;
        }
        
        // For local export, trigger the download immediately.
        executeLocalExport();

        // Defer closing the modal to ensure the browser processes the download trigger.
        setTimeout(() => {
            setIsProviderModalOpen(false);
        }, 100);
    };

    return (
        <div>
            <Header title="تصدير إلى Excel" icon="fa-file-excel" />
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    يمكنك تصدير جميع البيانات، أو تحديد نطاق زمني لتصفية سجلات المستفيدين والعمليات قبل التصدير.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
                    <div>
                        <label htmlFor="startDate" className={labelClasses}>من تاريخ</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className={labelClasses}>إلى تاريخ</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 my-6 max-w-2xl mx-auto">
                    سيتم تطبيق النطاق الزمني المحدد على سجلات المستفيدين (حسب تاريخ الانضمام) والعمليات (حسب تاريخ العملية).
                    <br/>
                    <b>لن يتم تطبيق الفلتر على بيانات الموظفين وأنواع المساعدات.</b>
                </p>

                <Button onClick={() => setIsProviderModalOpen(true)} icon="fa-download" variant="primary">
                    تصدير البيانات الآن
                </Button>
            </div>
             <FileProviderModal
                isOpen={isProviderModalOpen}
                onClose={() => setIsProviderModalOpen(false)}
                onSelectProvider={handleProviderSelection}
                title="اختر مكان تصدير الملف"
            />
        </div>
    );
};