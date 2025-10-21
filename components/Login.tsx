import React, { useState, FormEvent } from 'react';
import { ViewMode, AppUser, Teacher, Student } from '../types';
import TeacherIcon from './icons/TeacherIcon';
import StudentIcon from './icons/StudentIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CoNaIcon from './icons/CoNaIcon';

interface LoginProps {
  onLogin: (user: AppUser) => void;
}

const commonInputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all";
const commonButtonClass = "group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg";

const FormWrapper: React.FC<{ children: React.ReactNode; onBack?: () => void; title: string; icon: React.ReactNode }> = ({ children, onBack, title, icon }) => (
     <div className="relative animate-pop-in w-full">
        {onBack && (
            <button type="button" onClick={onBack} className="absolute top-0 left-0 text-gray-500 hover:text-gray-800 p-2">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
        )}
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-text-dark">{title}</h2>
        </div>
        <div className="mt-6">
            {children}
        </div>
    </div>
);


const TeacherForm: React.FC<{ onLogin: (user: Teacher) => void; onBack: () => void; }> = ({ onLogin, onBack }) => {
    const [name, setName] = useState('');
    const [className, setClassName] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !className.trim()) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onLogin({ role: ViewMode.TEACHER, name: name.trim(), className: className.trim() });
    };

    return (
        <FormWrapper onBack={onBack} title="Thông tin Giáo viên" icon={<TeacherIcon className="w-8 h-8 text-blue-500" />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 text-left mb-1">Họ và tên</label>
                    <input id="teacher-name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} required placeholder="VD: Cô Mai" />
                </div>
                <div>
                    <label htmlFor="teacher-class" className="block text-sm font-medium text-gray-700 text-left mb-1">Lớp giảng dạy</label>
                    <input id="teacher-class" type="text" value={className} onChange={e => setClassName(e.target.value)} className={commonInputClass} placeholder="VD: Lớp 4A, Lớp 5B" required />
                </div>
                <button type="submit" className={commonButtonClass.replace('bg-yellow-400', 'bg-blue-500').replace('hover:bg-yellow-500', 'hover:bg-blue-600').replace('focus:ring-yellow-500', 'focus:ring-blue-500')}>
                    Vào Bảng điều khiển
                </button>
            </form>
        </FormWrapper>
    );
};

const StudentForm: React.FC<{ onLogin: (user: Omit<Student, 'previousWeekCorrect' | 'currentWeekCorrect' | 'knowledgeSeeds'>) => void; onBack: () => void; }> = ({ onLogin, onBack }) => {
    const [name, setName] = useState('');
    const [className, setClassName] = useState('Lớp 4A');
    const [teacherName, setTeacherName] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !className.trim() || !teacherName.trim()) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onLogin({ 
            role: ViewMode.STUDENT, 
            name: name.trim(), 
            className: className.trim(), 
            teacherName: teacherName.trim() 
        });
    };

    return (
         <FormWrapper onBack={onBack} title="Thông tin Học sinh" icon={<StudentIcon className="w-8 h-8 text-blue-500" />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 text-left mb-1">Họ và tên của em</label>
                    <input id="student-name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} required placeholder="VD: Nguyễn Văn An"/>
                </div>
                <div>
                    <label htmlFor="student-class" className="block text-sm font-medium text-gray-700 text-left mb-1">Lớp của em</label>
                    <select id="student-class" value={className} onChange={e => setClassName(e.target.value)} className={commonInputClass}>
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(grade => (
                            <optgroup key={grade} label={`Khối ${grade}`}>
                                {['A', 'B', 'C', 'D'].map(c => <option key={`${grade}${c}`}>{`Lớp ${grade}${c}`}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="student-teacher" className="block text-sm font-medium text-gray-700 text-left mb-1">Tên giáo viên chủ nhiệm</label>
                    <input id="student-teacher" type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} className={commonInputClass} required placeholder="VD: Cô Mai" />
                </div>
                <button type="submit" className={commonButtonClass}>
                    Bắt đầu Luyện tập 🌟
                </button>
            </form>
        </FormWrapper>
    );
};


const RoleSelector: React.FC<{ onSelect: (mode: ViewMode) => void }> = ({ onSelect }) => (
    <div className="w-full animate-fade-in">
        <div className="animate-pop-in">
            <CoNaIcon className="mx-auto h-24 w-24 text-blue-500" waving />
            <h1 className="mt-4 text-3xl font-extrabold text-text-dark">
                Chào mừng đến với<br/>Bạn Học Thông Minh
            </h1>
            <p className="mt-2 text-text-light">
                Nền tảng học tập vui vẻ cho tương lai.
            </p>
        </div>
        <div className="space-y-4 pt-8">
           <p className="text-sm font-medium text-gray-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>Vui lòng chọn vai trò của bạn:</p>
            <button
              onClick={() => onSelect(ViewMode.TEACHER)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    <TeacherIcon className="h-6 w-6 text-blue-200 group-hover:text-white" />
                </span>
                Tôi là Giáo viên
            </button>
            <button
              onClick={() => onSelect(ViewMode.STUDENT)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-2xl text-yellow-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in"
               style={{ animationDelay: '0.4s' }}
            >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    <StudentIcon className="h-6 w-6 text-yellow-800" />
                </span>
                Tôi là Học sinh
            </button>
        </div>
    </div>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<ViewMode | null>(null);

  const renderContent = () => {
    switch(selectedRole) {
        case ViewMode.TEACHER:
            return <TeacherForm onLogin={onLogin as (user: Teacher) => void} onBack={() => setSelectedRole(null)} />;
        case ViewMode.STUDENT:
            return <StudentForm onLogin={onLogin as (user: Student) => void} onBack={() => setSelectedRole(null)} />;
        default:
            return <RoleSelector onSelect={setSelectedRole} />;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-2xl text-center transition-all duration-500">
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;
