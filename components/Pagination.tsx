import React from 'react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, onPageChange }) => {
    if (totalItems === 0) {
        return (
             <div className="mt-6 flex justify-center items-center text-gray-600 dark:text-gray-400">
                <span>إجمالي الصفوف: 0</span>
            </div>
        )
    }

    const getPageNumbers = () => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 2) {
            return [1, 2, 3];
        }
        if (currentPage >= totalPages - 1) {
            return [totalPages - 2, totalPages - 1, totalPages];
        }
        return [currentPage - 1, currentPage, currentPage + 1];
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-gray-600 dark:text-gray-400 text-sm">
            <span>إجمالي الصفوف: {totalItems}</span>
            {totalPages > 1 ? (
                <nav className="flex justify-center items-center space-x-1 space-x-reverse">
                    <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} variant="secondary" className="px-3 py-1">
                        <i className="fas fa-chevron-right ml-1"></i>
                        السابق
                    </Button>
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => onPageChange(number)}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                currentPage === number
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {number}
                        </button>
                    ))}
                    <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="secondary" className="px-3 py-1">
                        التالي
                        <i className="fas fa-chevron-left mr-1"></i>
                    </Button>
                </nav>
            ) : <div />}
            {totalPages > 1 ? (
                <span>صفحة {currentPage} من {totalPages}</span>
            ) : <div />}
        </div>
    );
};
