import React, { useState, useMemo } from 'react';
import { Exercise, Level, Teacher, Student } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import UsersIcon from './icons/UsersIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import SearchIcon from './icons/SearchIcon';
import SortUpDownIcon from './icons/SortUpDownIcon';
import TrashIcon from './icons/TrashIcon';
import BrainIcon from './icons/BrainIcon'; // New Icon

interface TeacherDashboardProps {
  exercises: Exercise[];
  topics: string[];
  onAddExercise: (exercise: Omit<Exercise, 'id'>[]) => void;
  onAddTopic: (topic: string) => void;
  teacher: Teacher;
  allStudents: Student[];
}

interface NewExerciseBatchItem {
  key: number; 
  question: string;
  answer: string;
  hint: string;
  level: Level;
}

const ExerciseBatchItemForm: React.FC<{
    exercise: NewExerciseBatchItem;
    index: number;
    isRemovable: boolean;
    onChange: (index: number, field: keyof Omit<NewExerciseBatchItem, 'key'>, value: string) => void;
    onRemove: (index: number) => void;
}> = ({ exercise, index, isRemovable, onChange, onRemove }) => {
    return (
        <div className="p-4 border-2 border-dashed rounded-xl relative bg-white animate-fade-in">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Câu hỏi #{index + 1}</span>
                {isRemovable && (
                    <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <div className="space-y-3">
                <div>
                    <label htmlFor={`question-${index}`} className="block text-xs font-medium text-gray-700">Câu hỏi</label>
                    <textarea id={`question-${index}`} value={exercise.question} onChange={e => onChange(index, 'question', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required></textarea>
                </div>
                <div>
                    <label htmlFor={`answer-${index}`} className="block text-xs font-medium text-gray-700">Đáp án</label>
                    <input type="text" id={`answer-${index}`} value={exercise.answer} onChange={e => onChange(index, 'answer', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`level-${index}`} className="block text-xs font-medium text-gray-700">Mức độ</label>
                        <select id={`level-${index}`} value={exercise.level} onChange={e => onChange(index, 'level', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required>
                            {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`hint-${index}`} className="block text-xs font-medium text-gray-700">Gợi ý <span className="text-gray-500">(không bắt buộc)</span></label>
                        <input type="text" id={`hint-${index}`} value={exercise.hint} onChange={e => onChange(index, 'hint', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ exercises, topics, onAddExercise, onAddTopic, teacher, allStudents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [batchDetails, setBatchDetails] = useState({ topic: '', grade: 'Lớp 1', skill: '' });
  const [newExercisesBatch, setNewExercisesBatch] = useState<NewExerciseBatchItem[]>([
    { key: Date.now(), question: '', answer: '', hint: '', level: Level.ADVANCED }
  ]);
  
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Pick<Exercise, 'question' | 'topic' | 'grade' | 'level'> | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });

  const myStudents = useMemo(() => {
    return allStudents.filter(student => student.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase());
  }, [allStudents, teacher.name]);

  const homeroomClass = useMemo(() => {
    if (myStudents.length > 0) {
      const classCounts = myStudents.reduce((acc, student) => {
        acc[student.className] = (acc[student.className] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.keys(classCounts).reduce((a, b) => classCounts[a] > classCounts[b] ? a : b);
    }
    return null;
  }, [myStudents]);

  const getStudentProgressInfo = (student: Student) => {
    const { currentWeekCorrect, previousWeekCorrect } = student;
    let progress = 0;
    let message = '';
    let colorClass = 'text-gray-600';

    if (previousWeekCorrect > 0) {
      progress = Math.round(((currentWeekCorrect - previousWeekCorrect) / previousWeekCorrect) * 100);
    } else if (currentWeekCorrect > 0) {
      progress = 100; 
    }

    if (progress >= 20) {
      message = `Tuần này con bạn tiến bộ ${progress}%, làm đúng nhiều hơn ${currentWeekCorrect - previousWeekCorrect} bài. Hãy khen con nhé!`;
      colorClass = 'text-green-600';
    } else if (progress < 0) {
      message = `Con đang gặp khó khăn, kết quả giảm ${Math.abs(progress)}% so với tuần trước. Cùng con xem lại các bài tập đã làm nhé!`;
      colorClass = 'text-red-600';
    } else {
      message = `Con giữ vững phong độ học tập. Hãy tiếp tục động viên con!`;
    }

    return { progress, message, colorClass };
  };

  const requestSort = (key: keyof Pick<Exercise, 'question' | 'topic' | 'grade' | 'level'>) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredExercises = useMemo(() => {
    let filtered = [...exercises];
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(ex => ex.topic === selectedTopic);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.question.toLowerCase().includes(lowercasedQuery) ||
        ex.topic.toLowerCase().includes(lowercasedQuery)
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [exercises, selectedTopic, searchQuery, sortConfig]);

  const resetForm = () => {
    setBatchDetails({ topic: '', grade: 'Lớp 1', skill: '' });
    setNewExercisesBatch([{ key: Date.now(), question: '', answer: '', hint: '', level: Level.ADVANCED }]);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lọc ra các bài tập hợp lệ (phải có câu hỏi và đáp án)
    const validExercises = newExercisesBatch.filter(
      (ex) => ex.question.trim() !== '' && ex.answer.trim() !== ''
    );

    if (validExercises.length === 0) {
      alert("Vui lòng thêm ít nhất một câu hỏi hợp lệ (câu hỏi và đáp án là bắt buộc).");
      return;
    }

    // Tạo mảng các đối tượng bài tập hoàn chỉnh để thêm vào
    const exercisesToAdd: Omit<Exercise, 'id'>[] = validExercises.map(ex => ({
      topic: batchDetails.topic,
      grade: batchDetails.grade,
      skill: batchDetails.skill,
      question: ex.question,
      answer: ex.answer,
      hint: ex.hint,
      level: ex.level,
    }));

    // Gọi hàm onAddExercise từ props với mảng bài tập mới
    onAddExercise(exercisesToAdd);

    // Thêm chủ đề mới nếu chưa tồn tại
    if (!topics.includes(batchDetails.topic)) {
      onAddTopic(batchDetails.topic);
    }
    
    alert(`Đã thêm thành công ${validExercises.length} bài tập!`);
    setIsModalOpen(false);
  };
  
  const SortableHeader: React.FC<{ columnKey: keyof Pick<Exercise, 'question' | 'topic' | 'grade' | 'level'>; title: string; className?: string }> = ({ columnKey, title, className = '' }) => {
    const isSorting = sortConfig.key === columnKey;
    const isAscending = sortConfig.direction === 'ascending';
    return (
        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
            <button onClick={() => requestSort(columnKey)} className="group inline-flex items-center gap-1">
                {title}
                <span className={`transition-opacity ${isSorting ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}>
                   <SortUpDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isSorting && !isAscending ? 'rotate-180' : ''}`} />
                </span>
            </button>
        </th>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-dark">Bảng điều khiển Giáo viên</h1>
          <p className="text-text-light mt-1">Quản lý lớp học và ngân hàng bài tập.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="mt-4 md:mt-0 flex items-center justify-center px-5 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Tạo bộ bài tập
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-text-dark flex items-center mb-4">
                    <UsersIcon className="w-6 h-6 mr-3 text-blue-500" />
                    Lớp chủ nhiệm: {homeroomClass || 'Chưa có'}
                </h2>
                {myStudents.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {myStudents.map((student) => {
                      const { progress, message, colorClass } = getStudentProgressInfo(student);
                      return (
                        <div key={student.name} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50 transition-shadow hover:shadow-md">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                              <div className="flex items-center" title="Hạt giống tri thức">
                                <SparklesIcon className="w-5 h-5 mr-1.5 text-yellow-500" />
                                <span className="font-bold text-gray-700">{student.knowledgeSeeds}</span>
                              </div>
                              <div className={`flex items-center font-bold ${colorClass}`} title="Tiến độ so với tuần trước">
                                <TrendingUpIcon className="w-5 h-5 mr-1.5" />
                                <span>{progress >= 0 ? `+${progress}` : progress}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700 italic">"{message}"</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Dựa trên thông tin đăng nhập của học sinh, bạn chưa được chỉ định làm giáo viên chủ nhiệm cho lớp nào.</p>
                )}
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-text-dark mb-4">Phân tích Lớp học (AI)</h2>
              <div className="space-y-4">
                  <div>
                      <h3 className="font-semibold text-text-light mb-2">Lỗi sai phổ biến</h3>
                      <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 italic">Biểu đồ lỗi sai</div>
                  </div>
                   <div>
                      <h3 className="font-semibold text-text-light mb-2">Gợi ý bài học kế tiếp</h3>
                      <div className="p-3 bg-blue-50 border-2 border-blue-100 rounded-xl text-blue-800 text-sm">
                        AI gợi ý: Nhiều học sinh đang yếu phần "Phép chia có dư". Thầy/cô nên tạo thêm bài tập về kỹ năng này.
                      </div>
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors">
                     <BrainIcon className="w-5 h-5"/> Tạo báo cáo PDF
                  </button>
              </div>
          </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-text-dark mb-4">Ngân hàng Bài tập</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Tìm câu hỏi hoặc chủ đề..."/>
                </div>
            </div>
            <div>
                <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Tất cả chủ đề</option>
                    {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          {sortedAndFilteredExercises.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader columnKey="question" title="Câu hỏi" />
                  <SortableHeader columnKey="topic" title="Chủ đề" />
                  <SortableHeader columnKey="grade" title="Cấp lớp" />
                  <SortableHeader columnKey="level" title="Mức độ" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">{ex.question}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ex.topic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ex.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ex.level === Level.BASIC ? 'bg-green-100 text-green-800' : ex.level === Level.INTERMEDIATE ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {ex.level}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
                <BookOpenIcon className="w-16 h-16 mx-auto text-gray-300" />
                <p className="mt-4 text-gray-500">Không tìm thấy bài tập nào.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo bộ bài tập mới">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border rounded-xl bg-gray-50 space-y-4">
                <h3 className="font-semibold text-gray-800">Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
                        <input type="text" name="topic" value={batchDetails.topic} onChange={e => setBatchDetails(prev => ({...prev, topic: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Cấp lớp</label>
                        <select name="grade" value={batchDetails.grade} onChange={e => setBatchDetails(prev => ({...prev, grade: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required>
                           {Array.from({ length: 5 }, (_, i) => `Lớp ${i + 1}`).map(g => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Kỹ năng</label>
                    <input type="text" name="skill" value={batchDetails.skill} onChange={e => setBatchDetails(prev => ({...prev, skill: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="VD: Cộng trong phạm vi 10" required />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Danh sách câu hỏi</h3>
                {newExercisesBatch.map((exercise, index) => (
                    <ExerciseBatchItemForm
                        key={exercise.key}
                        exercise={exercise}
                        index={index}
                        isRemovable={newExercisesBatch.length > 1}
                        onChange={(i, field, value) => {
                            const updated = [...newExercisesBatch];
                            updated[i] = {...updated[i], [field]: value};
                            setNewExercisesBatch(updated);
                        }}
                        onRemove={(i) => setNewExercisesBatch(prev => prev.filter((_, idx) => idx !== i))}
                    />
                ))}
            </div>

            <div>
                <button type="button" onClick={() => setNewExercisesBatch(p => [...p, { key: Date.now(), question: '', answer: '', hint: '', level: Level.BASIC }])} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    Thêm câu hỏi khác
                </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Lưu bộ bài tập</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;