import React, { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface SettingsPageProps {
    organizationName?: string;
    organizationLogo?: string;
    onSave: (name: string, logo: string) => void;
    showToast: (message: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ organizationName = 'مؤسسة الجارحي', organizationLogo = '', onSave, showToast }) => {
    const [name, setName] = useState(organizationName);
    const [logo, setLogo] = useState(organizationLogo);
    const [logoPreview, setLogoPreview] = useState(organizationLogo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogo(base64String);
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            showToast('الرجاء اختيار ملف بصيغة PNG فقط.');
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            showToast('اسم المؤسسة لا يمكن أن يكون فارغًا.');
            return;
        }
        onSave(name.trim(), logo);
        showToast('تم حفظ الإعدادات بنجاح.');
    };

    return (
        <div>
            <Header title="إعدادات المؤسسة" icon="fa-cog" />
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="orgName" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المؤسسة</label>
                        <input
                            id="orgName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">شعار المؤسسة</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fas fa-image text-4xl text-gray-400"></i>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept="image/png"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                    تغيير الشعار (PNG)
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">اختر ملف بصيغة PNG.</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                         <Button onClick={handleSave} icon="fa-save">حفظ التغييرات</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};