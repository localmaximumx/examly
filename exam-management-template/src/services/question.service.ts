import { Question, QuestionType } from '../types';
import { storageService } from './storage.service';

class QuestionService {
  public getAllQuestions(): Question[] {
    return storageService.getQuestionBank();
  }

  public getQuestionById(id: string): Question | undefined {
    return this.getAllQuestions().find(q => q.id === id);
  }

  public searchQuestions(
    query: string,
    filterSubject?: string,
    filterType?: QuestionType | string,
    filterDifficulty?: string
  ): Question[] {
    const list = this.getAllQuestions();
    const cleanQuery = query.toLowerCase().trim();

    return list.filter(q => {
      const matchText = !cleanQuery ||
        q.text.toLowerCase().includes(cleanQuery) ||
        (q.subject && q.subject.toLowerCase().includes(cleanQuery)) ||
        (q.topic && q.topic.toLowerCase().includes(cleanQuery));

      const matchSubject = !filterSubject || filterSubject === 'All' || q.subject === filterSubject;
      const matchType = !filterType || filterType === 'All' || q.type === filterType;
      const matchDifficulty = !filterDifficulty || filterDifficulty === 'All' || q.difficulty === filterDifficulty;

      return matchText && matchSubject && matchType && matchDifficulty;
    });
  }

  public addQuestion(question: Omit<Question, 'id'>): Question {
    const newQ: Question = {
      ...question,
      id: `QB-${Date.now().toString().slice(-4)}`
    };
    storageService.saveQuestion(newQ);
    return newQ;
  }

  public updateQuestion(question: Question): Question {
    storageService.saveQuestion(question);
    return question;
  }

  public deleteQuestion(id: string): void {
    storageService.deleteQuestion(id);
  }

  // Deep clone a question for independent inclusion into an examination
  public cloneForExam(question: Question, questionNumber: number): Question {
    return {
      ...question,
      id: `EXQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      questionNumber,
      options: question.options ? question.options.map(o => ({ ...o })) : undefined
    };
  }
}

export const questionService = new QuestionService();
