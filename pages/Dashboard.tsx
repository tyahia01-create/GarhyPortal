import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import type { Task, User } from '../types';

interface StatCardProps {
    icon: string;
    title: string;
    value: number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-6">
            <div className={`p-4 rounded-full ${color}`}>
                <i className={`fas ${icon} text-3xl text-white`}></i>
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

interface DashboardProps {
    stats: {
        employees: number;
        beneficiaries: number;
        operations: number;
    };
    currentUser: User | null;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, currentUser, tasks, setTasks }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingTaskText, setEditingTaskText] = useState('');

    const userTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks
            .filter(task => task.userId === currentUser.id)
            .sort((a, b) => {
                if (a.isCompleted !== b.isCompleted) {
                    return a.isCompleted ? 1 : -1;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [tasks, currentUser]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim() || !currentUser) return;

        const newTask: Task = {
            id: Date.now(),
            userId: currentUser.id,
            text: newTaskText.trim(),
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
        setNewTaskText('');
    };

    const handleToggleComplete = (taskId: number) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() } : task
            )
        );
    };

    const handleDeleteTask = (taskId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            setTasks(prev => prev.filter(task => task.id !== taskId));
        }
    };
    
    const handleStartEdit = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskText(task.text);
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditingTaskText('');
    };

    const handleSaveEdit = () => {
        if (!editingTaskId || !editingTaskText.trim()) return;
        setTasks(prev =>
            prev.map(task =>
                task.id === editingTaskId ? { ...task, text: editingTaskText.trim(), updatedAt: new Date().toISOString() } : task
            )
        );
        handleCancelEdit();
    };


    return (
        <div>
            <Header title="لوحة التحكم" icon="fa-tachometer-alt" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <StatCard icon="fa-users-cog" title="إجمالي الموظفين" value={stats.employees} color="bg-blue-500" />
               <StatCard icon="fa-user-friends" title="إجمالي المستفيدين" value={stats.beneficiaries} color="bg-emerald-500" />
               <StatCard icon="fa-exchange-alt" title="إجمالي العمليات" value={stats.operations} color="bg-purple-500" />
            </div>
            
            <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <i className="fas fa-tasks text-purple-400 mr-3"></i>
                    مهامي الخاصة
                </h2>
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="أضف مهمة جديدة..."
                        className="flex-grow p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-300 dark:border-gray-600"
                    />
                    <Button type="submit" icon="fa-plus" disabled={!newTaskText.trim()}>إضافة</Button>
                </form>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {userTasks.length > 0 ? (
                        userTasks.map(task => (
                            <div
                                key={task.id}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-300 ${task.isCompleted ? 'bg-gray-100 dark:bg-gray-700/50 opacity-60' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {editingTaskId === task.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingTaskText}
                                            onChange={(e) => setEditingTaskText(e.target.value)}
                                            className="flex-grow p-2 bg-gray-100 dark:bg-gray-600 rounded text-gray-900 dark:text-white border border-gray-300 dark:border-gray-500"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                            autoFocus
                                        />
                                        <Button onClick={handleSaveEdit} icon="fa-save" variant="primary" />
                                        <Button onClick={handleCancelEdit} icon="fa-times" variant="secondary" />
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleComplete(task.id)}
                                            className="form-checkbox h-5 w-5 text-emerald-500 bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                                        />
                                        <p className={`flex-grow ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {task.text}
                                        </p>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button onClick={() => handleStartEdit(task)} icon="fa-edit" variant="secondary" className="px-3 py-1" title="تعديل" />
                                            <Button onClick={() => handleDeleteTask(task.id)} icon="fa-trash" variant="danger" className="px-3 py-1" title="حذف" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="text-center p-6 text-gray-400 dark:text-gray-500">
                            <i className="fas fa-check-double text-4xl mb-3"></i>
                            <p>لا توجد مهام حاليًا. أضف مهمة جديدة للبدء!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};