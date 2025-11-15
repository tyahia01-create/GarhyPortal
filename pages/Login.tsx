import React, { useState } from 'react';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';

interface LoginPageProps {
    onLogin: (username: string, password: string) => boolean;
    organizationName?: string;
    organizationLogo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, organizationName, organizationLogo }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const loginSuccess = onLogin(username, password);
        
        if (!loginSuccess) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Branding Column */}
            <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-emerald-600 items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute bg-emerald-700 -bottom-32 -right-32 w-72 h-72 rounded-full opacity-50"></div>
                <div className="absolute bg-emerald-500 top-24 -left-36 w-80 h-80 rounded-full opacity-50"></div>
                <div className="z-10 text-center animate-fade-in-right">
                    {organizationLogo ? (
                        <img src={organizationLogo} alt="Organization Logo" className="w-24 h-24 mx-auto mb-6 rounded-full object-cover" />
                    ) : (
                        <i className="fas fa-hands-helping text-8xl mb-6 opacity-90"></i>
                    )}
                    <h1 className="text-5xl font-bold">{organizationName || 'مؤسسة الجارحي'}</h1>
                </div>
            </div>
            
            {/* Form Column */}
            <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-6 sm:p-12 bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md relative">
                    <div className="absolute top-0 right-0">
                        <ThemeToggle />
                    </div>

                    {/* Mobile Header */}
                    <div className="text-center md:hidden mb-8">
                         {organizationLogo ? (
                            <img src={organizationLogo} alt="Organization Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
                        ) : (
                            <i className="fas fa-hands-helping text-6xl text-emerald-500 dark:text-emerald-400 mb-4"></i>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{organizationName || 'مؤسسة الجارحي'}</h1>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">أهلاً بك مجدداً</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">يرجى تسجيل الدخول للمتابعة</p>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-gray-600 dark:text-gray-300 tracking-wide block mb-2">اسم المستخدم</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <i className="fas fa-user text-gray-400 dark:text-gray-500"></i>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 border border-gray-300 dark:border-gray-600"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-bold text-gray-600 dark:text-gray-300 tracking-wide block mb-2">كلمة المرور</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <i className="fas fa-lock text-gray-400 dark:text-gray-500"></i>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 border border-gray-300 dark:border-gray-600"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 p-3 rounded-lg text-center flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full h-12 text-lg" icon="fa-sign-in-alt">
                                تسجيل الدخول
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};