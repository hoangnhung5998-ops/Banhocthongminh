import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, Level } from '../types';

// Theo nguyên tắc lập trình, API key PHẢI được lấy độc quyền từ biến môi trường
// `process.env.API_KEY`. Chúng tôi giả định rằng biến này đã được cấu hình trước,
// hợp lệ và có thể truy cập được.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


let lastApiCallTimestamp = 0;
const API_COOLDOWN_MS = 2000; // 2 giây chờ

const canMakeApiCall = (): boolean => {
    const now = Date.now();
    if (now - lastApiCallTimestamp < API_COOLDOWN_MS) {
        console.log("Giới hạn tốc độ: Vui lòng đợi trước khi thực hiện một yêu cầu AI khác.");
        return false;
    }
    lastApiCallTimestamp = now;
    return true;
};

export const suggestQuestionsForTopic = async (topic: string): Promise<string[]> => {
  if (!canMakeApiCall()) return [];
    
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bạn là một trợ lý giáo dục AI. Hãy tạo ra 3 câu hỏi bài tập mẫu, ngắn gọn và súc tích cho chủ đề "${topic}" dành cho học sinh tiểu học ở Việt Nam. Chỉ trả về một đối tượng JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Một câu hỏi bài tập mẫu."
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    if (result && Array.isArray(result.questions)) {
      return result.questions;
    }
    
    return [];
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return [];
  }
};

export const generateExerciseForTopic = async (details: { topic: string; grade: string; skill: string; level: Level }): Promise<{ question: string; answer: string; hint: string } | null> => {
  if (!canMakeApiCall()) return null;
    
  try {
    const prompt = `Bạn là một trợ lý giáo dục AI. Hãy tạo một bài tập cho học sinh tiểu học với các thông tin sau:
- Chủ đề: "${details.topic}"
- Cấp lớp: "${details.grade}"
- Kỹ năng: "${details.skill}"
- Mức độ: "${details.level}"

Bài tập nên bao gồm một câu hỏi rõ ràng, một đáp án chính xác, và một gợi ý ngắn gọn (nếu cần).

Trả về một đối tượng JSON chỉ chứa ba khóa: "question", "answer", và "hint".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "Câu hỏi của bài tập."
            },
            answer: {
              type: Type.STRING,
              description: "Đáp án cho câu hỏi."
            },
            hint: {
              type: Type.STRING,
              description: "Gợi ý cho học sinh (có thể là chuỗi rỗng)."
            }
          },
          required: ["question", "answer", "hint"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && result.question && result.answer) {
      return { question: result.question, answer: result.answer, hint: result.hint || '' };
    }
    return null;

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API để tạo bài tập:", error);
    return null;
  }
};


export const generateSimilarExercise = async (originalExercise: Exercise): Promise<{ question: string; answer: string } | null> => {
    if (!canMakeApiCall()) return null;

  try {
    const prompt = `Bạn là một trợ lý giáo dục AI. Dựa vào bài tập mẫu sau đây:
- Chủ đề: "${originalExercise.topic}"
- Câu hỏi: "${originalExercise.question}"
- Đáp án: "${originalExercise.answer}"
- Cấp lớp: "${originalExercise.grade}"
- Kỹ năng: "${originalExercise.skill}"

Hãy tạo ra MỘT bài tập mới có cấu trúc, độ khó và chủ đề tương tự. Đảm bảo câu hỏi mới khác với câu hỏi gốc.

Trả về một đối tượng JSON chỉ chứa hai khóa: "newQuestion" và "newAnswer".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newQuestion: {
              type: Type.STRING,
              description: "Câu hỏi mới, tương tự câu hỏi gốc."
            },
            newAnswer: {
              type: Type.STRING,
              description: "Đáp án cho câu hỏi mới."
            }
          },
          required: ["newQuestion", "newAnswer"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && result.newQuestion && result.newAnswer) {
      return { question: result.newQuestion, answer: result.newAnswer };
    }

    return null;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API để tạo bài tập tương tự:", error);
    return null;
  }
};

export const suggestReviewTopics = async (exercise: Exercise): Promise<string[]> => {
  if (!canMakeApiCall()) return [];

  try {
    const prompt = `Bạn là một gia sư AI. Một học sinh tiểu học đã trả lời sai câu hỏi sau:
- Chủ đề: "${exercise.topic}"
- Kỹ năng: "${exercise.skill}"
- Câu hỏi: "${exercise.question}"

Dựa trên lỗi sai này, hãy gợi ý 3 chủ đề hoặc kỹ năng CÓ LIÊN QUAN mà học sinh này có thể cần ôn tập thêm. Các gợi ý phải ngắn gọn, súc tích và phù hợp với học sinh tiểu học.

Trả về một đối tượng JSON có một khóa duy nhất là "suggestions", chứa một mảng gồm 3 chuỗi gợi ý.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "Mảng các chủ đề/kỹ năng gợi ý để ôn tập.",
              items: { type: Type.STRING }
            }
          },
          required: ["suggestions"]
        }
      }
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && Array.isArray(result.suggestions)) {
      return result.suggestions;
    }
    
    return [];
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API để gợi ý chủ đề ôn tập:", error);
    return [];
  }
};

export const generateStepByStepExplanation = async (exercise: Exercise, wrongAnswer: string): Promise<string | null> => {
  if (!canMakeApiCall()) return null;

  try {
    const prompt = `Bạn là "Cô Na thông minh", một giáo viên AI thân thiện và kiên nhẫn, chuyên giảng bài cho học sinh tiểu học Việt Nam.
Một học sinh đã làm sai bài tập sau:
- Câu hỏi: "${exercise.question}"
- Đáp án đúng: "${exercise.answer}"
- Câu trả lời của học sinh: "${wrongAnswer}"

Nhiệm vụ của bạn là:
1.  **Không đưa ra đáp án đúng ngay lập tức.**
2.  Đưa ra một lời giải thích từng bước, dễ hiểu.
3.  Sử dụng phương pháp gợi mở, đặt câu hỏi để dẫn dắt học sinh tự suy luận.
4.  Giọng văn phải thật nhẹ nhàng, động viên và khích lệ.

Ví dụ: Nếu bài toán là "12 chia cho 4 bằng mấy?" và học sinh trả lời "2", bạn có thể nói: "Không sao đâu em, mình cùng làm lại nhé. Em thử đọc bảng cửu chương 4 xem nào, 4 nhân mấy thì bằng 12 nhỉ?"

Bây giờ, hãy tạo lời giải thích cho bài toán trên.
Trả về một đối tượng JSON chỉ có một khóa là "explanation".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "Lời giải thích từng bước, thân thiện của Cô Na thông minh."
            }
          },
          required: ["explanation"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    return result?.explanation || null;

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API để tạo lời giải thích:", error);
    return null;
  }
};

export interface PersonalizedFeedbackInput {
    studentName: string;
    topic: string;
    skill: string;
    timeTaken: number;
    errors: number;
}

export const generatePersonalizedFeedback = async (input: PersonalizedFeedbackInput): Promise<string | null> => {
    if (!canMakeApiCall()) return null;

    try {
        const prompt = `Bạn là "Bạn học thông minh 2.0", một AI đồng hành học tập nhân văn và thấu cảm. Nhiệm vụ của bạn là tạo ra một lời phản hồi cá nhân hóa, ngắn gọn (2-3 câu) để khích lệ một học sinh tiểu học đang gặp khó khăn.
        
        **Triết lý của bạn:**
        - Luôn dùng ngôn ngữ tích cực, động viên.
        - Không bao giờ chê bai hay so sánh.
        - Tôn trọng tốc độ học tập của mỗi em.
        - Giọng văn thân thiện như một người bạn hoặc cô giáo hiền.

        **Thông tin về học sinh:**
        - Tên: ${input.studentName}
        - Chủ đề: ${input.topic}
        - Kỹ năng đang luyện tập: ${input.skill}
        - Thời gian làm bài: ${input.timeTaken} giây
        - Số lần trả lời sai: ${input.errors}

        **Yêu cầu:**
        Dựa vào thông tin trên, hãy viết một lời phản hồi. Lời phản hồi phải bao gồm:
        1.  Gọi tên học sinh một cách thân mật.
        2.  Một câu động viên, công nhận sự cố gắng của em.
        3.  Một gợi ý cụ thể và nhẹ nhàng (ví dụ: "hít thở sâu", "nghỉ một chút", "đọc lại gợi ý", "xem lại bài giảng").
        4.  Kết thúc bằng một lời khích lệ và sử dụng ít nhất một emoji phù hợp.

        **Ví dụ:** "Lan ơi, cô thấy em cố gắng lắm rồi đó 💪. Hôm nay bài phép chia hơi khó, xem lại video cô hướng dẫn chia có dư nhé. Nghỉ 3 phút uống nước rồi mình tiếp tục nào!"

        **Chỉ trả về đối tượng JSON có một khóa duy nhất là "feedback".**`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: {
                            type: Type.STRING,
                            description: "Lời phản hồi động viên, được cá nhân hóa cho học sinh."
                        }
                    },
                    required: ["feedback"]
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        return result?.feedback || null;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API để tạo phản hồi cá nhân hóa:", error);
        return null;
    }
};