
import React from 'react';

interface HeaderProps {
    title: string;
    icon: string;
}

export const Header: React.FC<HeaderProps> = ({ title, icon }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                <i className={`fas ${icon} mr-4 text-emerald-500 dark:text-emerald-400`}></i>
                {title}
            </h1>
        </div>
    );
};