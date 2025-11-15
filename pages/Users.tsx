import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { User } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

type SortDirection = 'asc' | 'desc';
type UserSortKey = keyof User;
interface SortConfig {
    key: UserSortKey | null;
    direction: SortDirection;
}

interface UsersPageProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserAddForm: React.FC<{
    onSubmit: (user: Omit<User, 'id'>) => void;
    onClose: () => void;
    existingUsers: User[];
}> = ({ onSubmit, onClose, existingUsers }) => {
    const [formData, setFormData] = useState({ name: '', mobile: '', username: '', password: '', role: 'مستخدم' as 'مدير' | 'مستخدم' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white";


    const validate = (data: typeof formData) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.name.trim()) newErrors.name = 'الاسم الكامل مطلوب.';
        if (!data.mobile.trim()) {
            newErrors.mobile = 'رقم المحمول مطلوب.';
        } else if (!/^01[0125]\d{8}$/.test(data.mobile)) {
            newErrors.mobile = 'رقم المحمول يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.';
        } else if (existingUsers.some(u => u.mobile === data.mobile)) {
            newErrors.mobile = 'رقم المحمول هذا موجود بالفعل.';
        }
        if (!data.username.trim()) {
            newErrors.username = 'اسم المستخدم مطلوب.';
        } else if (existingUsers.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
            newErrors.username = 'اسم المستخدم هذا موجود بالفعل.';
        }
        if (!data.password) newErrors.password = 'كلمة المرور مطلوبة.';
        return newErrors;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" className={inputClasses} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="رقم المحمول" className={inputClasses} />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>
            <div>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="اسم المستخدم" className={inputClasses} />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="كلمة المرور" className={inputClasses} />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClasses}>
                    <option value="مستخدم">مستخدم</option>
                    <option value="مدير">مدير</option>
                </select>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">إضافة مستخدم</Button>
            </div>
        </form>
    );
};

const UserEditForm: React.FC<{
    onSubmit: (data: Pick<User, 'name' | 'mobile' | 'role'>) => void;
    onClose: () => void;
    userToEdit: User;
    existingUsers: User[];
}> = ({ onSubmit, onClose, userToEdit, existingUsers }) => {
    const [formData, setFormData] = useState({
        name: userToEdit.name,
        mobile: userToEdit.mobile,
        role: userToEdit.role
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white";

    const validate = (data: typeof formData) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.name.trim()) newErrors.name = 'الاسم الكامل مطلوب.';
        if (!data.mobile.trim()) {
            newErrors.mobile = 'رقم المحمول مطلوب.';
        } else if (!/^01[0125]\d{8}$/.test(data.mobile)) {
            newErrors.mobile = 'رقم المحمول يجب أن يكون 11 رقمًا.';
        } else if (existingUsers.some(u => u.id !== userToEdit.id && u.mobile === data.mobile)) {
            newErrors.mobile = 'رقم المحمول هذا مستخدم بالفعل.';
        }
        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="الاسم الكامل" className={inputClasses} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
             <div>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="رقم المحمول" className={inputClasses} />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} required className={inputClasses} disabled={userToEdit.username === 'Admin'}>
                    <option value="مستخدم">مستخدم</option>
                    <option value="مدير">مدير</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">تعديل</Button>
            </div>
        </form>
    );
};


const PasswordChangeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    username: string;
}> = ({ isOpen, onClose, onSubmit, username }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const inputClasses = "w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white";


    useEffect(() => {
        if (password && confirmPassword && password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
        } else {
            setError('');
        }
    }, [password, confirmPassword]);
    
    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !password) return;
        onSubmit(password);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تغيير كلمة مرور: ${username}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" required className={inputClasses} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" required className={inputClasses} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" variant="primary" disabled={!!error || !password}>تغيير</Button>
                </div>
            </form>
        </Modal>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    username: string;
}> = ({ isOpen, onClose, onConfirm, username }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="تأكيد الحذف">
        <p>هل أنت متأكد من حذف المستخدم "{username}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex justify-end space-x-2 space-x-reverse pt-6">
            <Button variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button variant="danger" onClick={onConfirm}>تأكيد الحذف</Button>
        </div>
    </Modal>
);

export const UsersPage: React.FC<UsersPageProps> = ({ users, setUsers }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    const [selectedIds, setSelectedIds] = useState(new Set<number>());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const filteredUsers = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedSearchTerm) return users;
        return users.filter(u =>
            u.name.toLowerCase().includes(lowercasedSearchTerm) ||
            u.username.toLowerCase().includes(lowercasedSearchTerm) ||
            u.mobile.includes(lowercasedSearchTerm)
        );
    }, [users, searchTerm]);
    
    const sortedUsers = useMemo(() => {
        let sortableItems = [...filteredUsers];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];
                
                let comparison = 0;
                if (valA > valB) {
                    comparison = 1;
                } else if (valA < valB) {
                    comparison = -1;
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [filteredUsers, sortConfig]);

     useEffect(() => {
        if (headerCheckboxRef.current) {
            const currentUsersOnPage = sortedUsers.map(u => u.id);
            const numSelected = currentUsersOnPage.filter(id => selectedIds.has(id)).length;
            headerCheckboxRef.current.checked = numSelected === currentUsersOnPage.length && currentUsersOnPage.length > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < currentUsersOnPage.length;
        }
    }, [selectedIds, sortedUsers]);

    const requestSort = (key: UserSortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirectionIcon = (key: UserSortKey) => {
         if (sortConfig.key !== key) {
            return 'fa-sort text-gray-500';
         }
         return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };


    const handleAddUser = (newUser: Omit<User, 'id'>) => {
        setUsers(prev => [...prev, { ...newUser, id: Date.now() }]);
        setIsAddModalOpen(false);
    };

    const handleEditUser = (updatedData: Pick<User, 'name' | 'mobile' | 'role'>) => {
        if (!selectedUser) return;
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u));
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleChangePassword = (password: string) => {
        if (!selectedUser) return;
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, password } : u));
        setIsPasswordModalOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = () => {
        if (!selectedUser) return;
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setIsConfirmModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleBulkDelete = () => {
        const usersToDelete = users.filter(u => selectedIds.has(u.id) && u.username !== 'Admin');
        if (usersToDelete.length === 0) {
            alert('لا يمكن حذف المستخدم الرئيسي "Admin".');
            return;
        }

        if (window.confirm(`هل أنت متأكد من حذف ${usersToDelete.length} مستخدم (مستخدمين)؟`)) {
            setUsers(prev => prev.filter(u => !selectedIds.has(u.id) || u.username === 'Admin'));
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
            setSelectedIds(new Set(sortedUsers.map(u => u.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const ThSortable: React.FC<{ sortKey: UserSortKey; label: string; }> = ({ sortKey, label }) => (
        <th className="p-3">
            <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-end text-right font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none">
                <span>{label}</span>
                <i className={`fas ${getSortDirectionIcon(sortKey)} mr-2`}></i>
            </button>
        </th>
    );

    return (
        <div>
            <Header title="إدارة المستخدمين" icon="fa-user-shield" />
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم/اسم المستخدم/المحمول..."
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
                    <Button icon="fa-plus" onClick={() => setIsAddModalOpen(true)}>إضافة مستخدم جديد</Button>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-center w-12">
                                <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                            </th>
                            <ThSortable sortKey="name" label="الاسم الكامل" />
                            <ThSortable sortKey="username" label="اسم المستخدم" />
                            <ThSortable sortKey="mobile" label="رقم المحمول" />
                            <ThSortable sortKey="role" label="الفئة" />
                            <th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map(user => (
                            <tr key={user.id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${selectedIds.has(user.id) ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                <td className="p-3 text-center">
                                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => handleSelect(user.id)} className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer" />
                                </td>
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.username}</td>
                                <td className="p-3">{user.mobile}</td>
                                <td className="p-3">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.role === 'مدير' ? 'bg-emerald-800 text-emerald-200' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-3 flex space-x-2 space-x-reverse">
                                     <Button variant="secondary" onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }} title="تعديل المستخدم">
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button variant="secondary" onClick={() => { setSelectedUser(user); setIsPasswordModalOpen(true); }} title="تغيير كلمة المرور">
                                        <i className="fas fa-key"></i>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => { setSelectedUser(user); setIsConfirmModalOpen(true); }}
                                        disabled={user.username === 'Admin'}
                                        title={user.username === 'Admin' ? 'لا يمكن حذف المستخدم الرئيسي' : 'حذف المستخدم'}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedUsers.length === 0 && (
                    <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                        لا توجد بيانات تطابق معايير البحث الحالية.
                    </div>
                )}
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة مستخدم جديد">
                <UserAddForm onSubmit={handleAddUser} onClose={() => setIsAddModalOpen(false)} existingUsers={users} />
            </Modal>
            {selectedUser && (
                <>
                    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`تعديل مستخدم: ${selectedUser.username}`}>
                        <UserEditForm
                           userToEdit={selectedUser}
                           onSubmit={handleEditUser}
                           onClose={() => setIsEditModalOpen(false)}
                           existingUsers={users}
                        />
                    </Modal>
                    <PasswordChangeModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                        onSubmit={handleChangePassword}
                        username={selectedUser.username}
                    />
                    <ConfirmationModal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleDeleteUser}
                        username={selectedUser.username}
                    />
                </>
            )}
        </div>
    );
};