import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, Student } from '../types';
import { generateSimilarExercise, suggestReviewTopics, generateStepByStepExplanation, generatePersonalizedFeedback } from '../services/geminiService';
import BookOpenIcon from './icons/BookOpenIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ChatBubbleBottomCenterTextIcon from './icons/ChatBubbleBottomCenterTextIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import CoNaIcon from './icons/CoNaIcon';
// FIX: Import ArrowLeftIcon to resolve 'Cannot find name' error.
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const getTopicColors = (topic: string): { bg: string, text: string, border: string } => {
    switch (topic) {
        case 'Toán': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
        case 'Tiếng Việt': return { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' };
        case 'Tự nhiên & Xã hội': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
        case 'Lịch sử & Địa lí': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
        default: return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' };
    }
};

const Confetti: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 1.5}s`,
          backgroundColor: ['#FFD166', '#6CC4FF', '#FFC0CB'][Math.floor(Math.random() * 3)],
          transform: `scale(${Math.random() * 0.7 + 0.5})`,
        }}
      />
    ))}
  </div>
);

interface StudentViewProps {
  exercises: Exercise[];
  topics: string[];
  user: Student;
  onUpdateStudentData: (studentName: string, className: string, updates: Partial<Pick<Student, 'currentWeekCorrect' | 'knowledgeSeeds'>>) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ exercises, topics, user, onUpdateStudentData }) => {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: { message: string, correct: boolean } | null }>({});
  const [attempts, setAttempts] = useState<{ [key: string]: number }>({});
  const [miniTeacherFeedback, setMiniTeacherFeedback] = useState<{ [key: string]: string | null }>({});
  const [isExplaining, setIsExplaining] = useState<{ [key: string]: boolean }>({});
  const [showConfetti, setShowConfetti] = useState<string | null>(null);

  const exercisesForTopic = useMemo(() => {
    if (!currentTopic) return [];
    return exercises.filter(ex => ex.topic === currentTopic);
  }, [exercises, currentTopic]);

  const correctAnswersCount = useMemo(() => {
    return exercisesForTopic.filter(ex => feedback[ex.id]?.correct).length;
  }, [feedback, exercisesForTopic]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setFeedback(prev => ({ ...prev, [id]: null }));
    setMiniTeacherFeedback(prev => ({ ...prev, [id]: null }));
  };

  const checkAnswer = async (exercise: Exercise) => {
    const userAnswer = answers[exercise.id] || '';
    const isCorrect = userAnswer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    const currentAttempts = attempts[exercise.id] || 0;

    setMiniTeacherFeedback(prev => ({ ...prev, [exercise.id]: null }));

    if (isCorrect) {
      if (currentAttempts === 0) {
        onUpdateStudentData(user.name, user.className, {
            currentWeekCorrect: user.currentWeekCorrect + 1,
            knowledgeSeeds: user.knowledgeSeeds + 10,
        });
      }
      setFeedback(prev => ({ ...prev, [exercise.id]: { message: 'Tuyệt vời!', correct: true } }));
      setShowConfetti(exercise.id);
      setAttempts(prev => ({ ...prev, [exercise.id]: 0 }));
    } else {
      const newAttempts = currentAttempts + 1;
      setAttempts(prev => ({ ...prev, [exercise.id]: newAttempts }));
      setFeedback(prev => ({ ...prev, [exercise.id]: { message: 'Thử lại nhé, cô tin em làm được!', correct: false } }));

      if (newAttempts >= 2) {
        setIsExplaining(prev => ({ ...prev, [exercise.id]: true }));
        const explanation = await generateStepByStepExplanation(exercise, userAnswer);
        setMiniTeacherFeedback(prev => ({ ...prev, [exercise.id]: explanation }));
        setIsExplaining(prev => ({ ...prev, [exercise.id]: false }));
      }
    }
  };
  
  const TopicSelectionScreen = () => (
    <div className="text-center py-8">
      <div className="relative inline-block mb-8">
        <CoNaIcon className="w-24 h-24 text-blue-500" />
      </div>
      <p className="text-xl text-text-light mb-8">Hãy chọn một môn học để bắt đầu nào!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map(topic => {
          const { bg, text, border } = getTopicColors(topic);
          return (
            <button
              key={topic}
              onClick={() => setCurrentTopic(topic)}
              className={`p-6 rounded-2xl ${bg} ${text} border-2 ${border} shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center space-y-3`}
            >
              <BookOpenIcon className="w-12 h-12" />
              <span className="text-xl font-bold">{topic}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-text-dark mb-4">🌳 Cây Tri Thức Của Em 🌳</h3>
          <p className="text-text-light mb-4">Mỗi câu trả lời đúng sẽ giúp cây lớn hơn một chút. Cố lên nhé!</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${Math.min((user.knowledgeSeeds / 500) * 100, 100)}%` }}></div>
          </div>
          <p className="text-sm font-semibold text-gray-600">Điểm Hạt Giống: <span className="text-yellow-600">{user.knowledgeSeeds}</span></p>
      </div>
    </div>
  );

  const ExerciseScreen = () => (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setCurrentTopic(null)} className="flex items-center gap-2 text-text-light hover:text-text-dark font-semibold">
          <ArrowLeftIcon className="w-5 h-5" />
          Quay lại chọn môn
        </button>
        <h2 className="text-3xl font-extrabold text-text-dark">{currentTopic}</h2>
      </div>
      
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md mb-6">
        <h3 className="font-bold text-center mb-2">Tiến độ</h3>
        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-500 flex items-center justify-end" style={{ width: `${(correctAnswersCount / exercisesForTopic.length) * 100}%` }}>
             <span className="text-2xl mr-2 transform -translate-y-0.5">⭐</span>
          </div>
        </div>
         <p className="text-center text-sm mt-2 font-semibold">{correctAnswersCount} / {exercisesForTopic.length} câu đúng</p>
      </div>

      <div className="space-y-6">
        {exercisesForTopic.map((ex, index) => (
          <div key={ex.id} className="bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden animate-pop-in">
            {showConfetti === ex.id && <Confetti />}
            <p className="text-lg font-bold text-text-dark mb-4">{index + 1}. {ex.question}</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
              <input
                type="text"
                value={answers[ex.id] || ''}
                onChange={(e) => handleAnswerChange(ex.id, e.target.value)}
                className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập câu trả lời của em..."
                onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer(ex); }}
              />
              <button
                onClick={() => checkAnswer(ex)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Nộp bài
              </button>
            </div>

            {feedback[ex.id] && (
              <div className={`p-3 rounded-xl text-center font-semibold animate-pop-in ${feedback[ex.id]?.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {feedback[ex.id]?.message} {feedback[ex.id]?.correct ? '🎉' : '💪'}
              </div>
            )}
            
            {isExplaining[ex.id] && (
              <div className="mt-3 text-sm text-gray-500 animate-pulse">Cô Na đang suy nghĩ...</div>
            )}
            
            {miniTeacherFeedback[ex.id] && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl animate-fade-in shadow-inner">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <CoNaIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-sm text-purple-900">
                  <p className="font-bold mb-1">Cô Na thông minh:</p>
                  <p>{miniTeacherFeedback[ex.id]}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {currentTopic ? <ExerciseScreen /> : <TopicSelectionScreen />}
    </div>
  );
};

export default StudentView;