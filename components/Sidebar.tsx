import React from 'react';
import type { User } from '../types';
import { ThemeToggle } from './ThemeToggle';

type View = 'dashboard' | 'users' | 'employees' | 'beneficiaries' | 'assistance' | 'operations' | 'incentive' | 'search' | 'export' | 'backup' | 'settings';

interface SidebarProps {
    setView: (view: View) => void;
    currentView: View;
    onLogout: () => void;
    currentUser: User | null;
    organizationName?: string;
    organizationLogo?: string;
}

const NavLink: React.FC<{
    icon: string;
    label: string;
    view?: View;
    currentView: View;
    onClick: () => void;
    isLogout?: boolean;
}> = ({ icon, label, view, currentView, onClick, isLogout = false }) => (
    <li
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
            isLogout
                ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-600 dark:hover:text-red-300'
                : (currentView === view
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white')
        }`}
    >
        <i className={`fas ${icon} w-6 text-center`}></i>
        <span className="mr-4">{label}</span>
    </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ setView, currentView, onLogout, currentUser, organizationName, organizationLogo }) => {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col transition-all duration-300">
            <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                 {organizationLogo ? (
                    <img src={organizationLogo} alt="Organization Logo" className="w-16 h-16 mx-auto mb-2 rounded-full object-cover" />
                ) : (
                    <i className="fas fa-hands-helping text-5xl text-emerald-500 dark:text-emerald-400 mb-2"></i>
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{organizationName || 'مؤسسة الجارحي'}</h1>
            </div>
            <nav className="flex-1 p-4 flex flex-col justify-between">
                <ul>
                    <NavLink icon="fa-tachometer-alt" label="لوحة التحكم" view="dashboard" currentView={currentView} onClick={() => setView('dashboard')} />
                    {currentUser?.role === 'مدير' && (
                        <NavLink icon="fa-user-shield" label="إدارة المستخدمين" view="users" currentView={currentView} onClick={() => setView('users')} />
                    )}
                    <NavLink icon="fa-users-cog" label="الموظفين" view="employees" currentView={currentView} onClick={() => setView('employees')} />
                    <NavLink icon="fa-user-friends" label="المستفيدين" view="beneficiaries" currentView={currentView} onClick={() => setView('beneficiaries')} />
                    <NavLink icon="fa-box-open" label="أنواع المساعدات" view="assistance" currentView={currentView} onClick={() => setView('assistance')} />
                    <NavLink icon="fa-exchange-alt" label="العمليات" view="operations" currentView={currentView} onClick={() => setView('operations')} />
                    <NavLink icon="fa-award" label="شاشة الحافز" view="incentive" currentView={currentView} onClick={() => setView('incentive')} />
                    <NavLink icon="fa-search" label="بحث" view="search" currentView={currentView} onClick={() => setView('search')} />
                    <NavLink icon="fa-file-excel" label="تصدير Excel" view="export" currentView={currentView} onClick={() => setView('export')} />
                    <NavLink icon="fa-database" label="النسخ الاحتياطي والاستعادة" view="backup" currentView={currentView} onClick={() => setView('backup')} />
                    {currentUser?.role === 'مدير' && (
                        <NavLink icon="fa-cog" label="إعدادات المؤسسة" view="settings" currentView={currentView} onClick={() => setView('settings')} />
                    )}
                </ul>
                <ul>
                    <ThemeToggle asSidebarItem />
                    <NavLink icon="fa-sign-out-alt" label="تسجيل الخروج" currentView={currentView} onClick={onLogout} isLogout />
                </ul>
            </nav>
            <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700">
                © 2025 مؤسسة الجارحي للتنمية المجتمعيه
            </div>
        </aside>
    );
};
