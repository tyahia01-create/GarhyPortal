import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    copyText?: string;
    type: 'success' | 'info';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, copyText, type, onClose }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsFadingOut(true);
        setTimeout(onClose, 300); // Match animation duration
    };
    
    const handleCopy = async () => {
        if (copyText) {
            try {
                await navigator.clipboard.writeText(copyText);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const typeClasses = {
        info: {
            bg: 'bg-gray-800',
            border: 'border-emerald-500',
            icon: 'fa-info-circle',
            iconColor: 'text-emerald-400',
        },
        success: {
            bg: 'bg-gray-800',
            border: 'border-emerald-500',
            icon: 'fa-check-circle',
            iconColor: 'text-emerald-400',
        },
    };

    const styles = typeClasses[type];

    return (
        <div 
            className={`flex items-start p-4 rounded-lg shadow-2xl border-r-4 ${styles.bg} ${styles.border} transition-all duration-300 transform ${isFadingOut ? 'opacity-0 translate-x-[-100%]' : 'opacity-100 translate-x-0'} animate-fade-in-right max-w-sm text-right`}
            role="alert"
        >
            <div className={`mr-3 text-2xl ${styles.iconColor}`}>
                <i className={`fas ${styles.icon}`}></i>
            </div>
            <div className="flex-1">
                <p className="text-gray-100">{message}</p>
                {copyText && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-400 break-all">
                            اسم الملف: <span className="font-mono">{copyText}</span>
                        </p>
                        <button
                            onClick={handleCopy}
                            className="mt-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-white"
                        >
                            {isCopied ? <><i className="fas fa-check mr-1 text-emerald-400"></i> تم النسخ</> : <><i className="fas fa-copy mr-1"></i> نسخ الاسم</>}
                        </button>
                    </div>
                )}
            </div>
             <button onClick={handleClose} className="ml-4 text-gray-500 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};
