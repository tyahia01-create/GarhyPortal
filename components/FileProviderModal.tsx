import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

type Provider = 'local' | 'google_drive';

interface FileProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProvider: (provider: Provider) => void;
    title: string;
}

export const FileProviderModal: React.FC<FileProviderModalProps> = ({ isOpen, onClose, onSelectProvider, title }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4 flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                    onClick={() => onSelectProvider('local')}
                    className="group flex flex-col items-center justify-center w-48 h-48 bg-gray-700 rounded-lg hover:bg-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-transparent hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <i className="fas fa-desktop text-6xl text-emerald-400 mb-4 transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-xl font-bold text-white">جهاز الكمبيوتر</span>
                    <span className="text-sm text-gray-400">حفظ/فتح من جهازك</span>
                </button>

                <button
                    onClick={() => onSelectProvider('google_drive')}
                    className="group flex flex-col items-center justify-center w-48 h-48 bg-gray-700 rounded-lg hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <i className="fab fa-google-drive text-6xl text-blue-400 mb-4 transition-transform duration-300 group-hover:scale-110"></i>
                    <span className="text-xl font-bold text-white">Google Drive</span>
                    <span className="text-sm text-gray-400">حفظ/فتح من درايف</span>
                </button>
            </div>
            <div className="flex justify-center pt-6">
                <Button variant="secondary" onClick={onClose}>إلغاء</Button>
            </div>
        </Modal>
    );
};
