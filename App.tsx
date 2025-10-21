import React, { useState, useCallback } from 'react';
import { Exercise, Level, ViewMode, AppUser, Teacher, Student } from './types';
import TeacherDashboard from './components/TeacherDashboard';
import StudentView from './components/StudentView';
import Login from './components/Login';
import CoNaIcon from './components/icons/CoNaIcon';

const initialExercisesData: Exercise[] = [
  {
    id: '1',
    topic: 'Toán',
    grade: 'Lớp 1',
    skill: 'Cộng trong phạm vi 10',
    level: Level.BASIC,
    question: '2 + 5 = ?',
    answer: '7',
    hint: 'Hãy đếm ngón tay xem sao.',
  },
  {
    id: '2',
    topic: 'Toán',
    grade: 'Lớp 1',
    skill: 'Cộng trong phạm vi 10',
    level: Level.BASIC,
    question: '8 + 1 = ?',
    answer: '9',
    hint: 'Thêm 1 vào một số sẽ được số liền sau.',
  },
  {
    id: '3',
    topic: 'Tiếng Việt',
    grade: 'Lớp 3',
    skill: 'Phân biệt danh từ, động từ',
    level: Level.INTERMEDIATE,
    question: 'Trong câu "Mẹ đang nấu cơm", từ "nấu" là loại từ gì?',
    answer: 'Động từ',
    hint: 'Từ chỉ hoạt động của sự vật.',
  },
  {
    id: '4',
    topic: 'Toán',
    grade: 'Lớp 4',
    skill: 'Nhân số có hai chữ số',
    level: Level.ADVANCED,
    question: '25 x 15 = ?',
    answer: '375',
    hint: 'Bạn có thể tách 15 thành 10 + 5.',
  },
  {
    id: '5',
    topic: 'Tự nhiên & Xã hội',
    grade: 'Lớp 4',
    skill: 'Hệ mặt trời',
    level: Level.INTERMEDIATE,
    question: 'Hành tinh nào được mệnh danh là "Hành tinh Đỏ"?',
    answer: 'Sao Hỏa',
    hint: 'Đây là hành tinh thứ tư tính từ Mặt Trời.',
  },
  {
    id: '6',
    topic: 'Tự nhiên & Xã hội',
    grade: 'Lớp 5',
    skill: 'Sự sống',
    level: Level.BASIC,
    question: 'Thực vật cần gì để quang hợp?',
    answer: 'Ánh sáng mặt trời',
    hint: 'Quá trình này tạo ra năng lượng cho cây.',
  },
  {
    id: '7',
    topic: 'Lịch sử & Địa lí',
    grade: 'Lớp 4',
    skill: 'Lịch sử Việt Nam',
    level: Level.BASIC,
    question: 'Ai là người lãnh đạo cuộc khởi nghĩa Hai Bà Trưng?',
    answer: 'Trưng Trắc và Trưng Nhị',
    hint: 'Hai chị em gái quê ở Mê Linh.',
  },
  {
    id: '8',
    topic: 'Lịch sử & Địa lí',
    grade: 'Lớp 5',
    skill: 'Địa lí Việt Nam',
    level: Level.INTERMEDIATE,
    question: 'Thủ đô của Việt Nam là thành phố nào?',
    answer: 'Hà Nội',
    hint: 'Thành phố này nằm ở miền Bắc.',
  },
];

// Dữ liệu mẫu cho danh sách học sinh
const initialStudentsData: Student[] = [
  {
    role: ViewMode.STUDENT,
    name: 'Nguyễn Văn An',
    className: 'Lớp 4A',
    teacherName: 'Cô Mai',
    previousWeekCorrect: 10,
    currentWeekCorrect: 13,
    knowledgeSeeds: 150,
  },
  {
    role: ViewMode.STUDENT,
    name: 'Trần Thị Bình',
    className: 'Lớp 4A',
    teacherName: 'Cô Mai',
    previousWeekCorrect: 15,
    currentWeekCorrect: 12,
    knowledgeSeeds: 120,
  },
  {
    role: ViewMode.STUDENT,
    name: 'Lê Văn Cường',
    className: 'Lớp 4A',
    teacherName: 'Cô Mai',
    previousWeekCorrect: 12,
    currentWeekCorrect: 12,
    knowledgeSeeds: 180,
  },
    {
    role: ViewMode.STUDENT,
    name: 'Phạm Thị Dung',
    className: 'Lớp 5B',
    teacherName: 'Thầy Hùng',
    previousWeekCorrect: 8,
    currentWeekCorrect: 11,
    knowledgeSeeds: 210,
  },
   {
    role: ViewMode.STUDENT,
    name: 'Hoàng Văn Em',
    className: 'Lớp 5B',
    teacherName: 'Thầy Hùng',
    previousWeekCorrect: 14,
    currentWeekCorrect: 10,
    knowledgeSeeds: 95,
  },
];


const initialTopicsData = [...new Set(initialExercisesData.map(ex => ex.topic))];

const App: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercisesData);
  const [topics, setTopics] = useState<string[]>(initialTopicsData);
  const [allStudents, setAllStudents] = useState<Student[]>(initialStudentsData);
  const [user, setUser] = useState<AppUser | null>(null);

  const handleAddExercise = useCallback((newExercises: Omit<Exercise, 'id'>[]) => {
    const fullExercises = newExercises.map((ex, index) => ({
        ...ex,
        id: `ex-${Date.now()}-${index}-${Math.random()}`
    }));
    setExercises(prev => [...prev, ...fullExercises]);
  }, []);

  const handleAddTopic = useCallback((topic: string) => {
    if (!topics.includes(topic)) {
      setTopics(prev => [...prev, topic]);
    }
  }, [topics]);

  const handleUpdateStudentData = useCallback((studentName: string, className: string, updates: Partial<Pick<Student, 'currentWeekCorrect' | 'knowledgeSeeds'>>) => {
    setAllStudents(prevStudents =>
        prevStudents.map(student => {
            if (student.name === studentName && student.className === className) {
                return { ...student, ...updates };
            }
            return student;
        })
    );
  }, []);

  const handleLogin = (loggedInUser: AppUser) => {
    // For students, check if they exist. If so, load their data. If not, create them.
    if (loggedInUser.role === ViewMode.STUDENT) {
      const studentIdentifier = `${loggedInUser.name.trim().toLowerCase()}-${loggedInUser.className.trim().toLowerCase()}`;
      const existingStudent = allStudents.find(
        (s) =>
          `${s.name.trim().toLowerCase()}-${s.className.trim().toLowerCase()}` ===
          studentIdentifier
      );

      if (existingStudent) {
        setUser(existingStudent);
      } else {
        // This is a new student logging in.
        const newStudent: Student = {
          ...(loggedInUser as Omit<Student, 'previousWeekCorrect' | 'currentWeekCorrect' | 'knowledgeSeeds'>),
          previousWeekCorrect: 0,
          currentWeekCorrect: 0,
          knowledgeSeeds: 0,
        };
        setAllStudents((prev) => [...prev, newStudent]);
        setUser(newStudent);
      }
    } else {
      setUser(loggedInUser);
    }
  };

  const renderView = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    switch (user.role) {
      case ViewMode.TEACHER:
        return (
          <TeacherDashboard
            exercises={exercises}
            topics={topics}
            onAddExercise={handleAddExercise}
            onAddTopic={handleAddTopic}
            teacher={user as Teacher}
            allStudents={allStudents}
          />
        );
      case ViewMode.STUDENT:
        return (
          <StudentView
            exercises={exercises}
            topics={topics}
            user={user as Student}
            onUpdateStudentData={handleUpdateStudentData}
          />
        );
      default:
        // Fallback to login if user role is unknown
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-bg-light min-h-screen font-sans">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <CoNaIcon className="w-8 h-8 text-blue-500" />
            <h1 className="ml-3 text-xl font-bold text-text-dark">Bạn Học Thông Minh</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, <span className="font-bold">{user.name}</span>
              </span>
              <button
                onClick={() => setUser(null)}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">{renderView()}</main>
    </div>
  );
};

export default App;
