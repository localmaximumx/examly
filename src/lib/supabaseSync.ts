import { supabase } from './supabase';
import { User, Student, ClassGroup, Examination, ExaminationSubmission } from '../types';

/**
 * Supabase Data Sync Service
 * Handles cloud synchronization for users, classrooms, exams, and submissions.
 * Designed with offline-first resilience: writes locally first, then syncs to Supabase.
 */

export const supabaseSync = {
  // --- USERS SYNC ---
  async syncUserToCloud(user: User | Student, password?: string): Promise<boolean> {
    try {
      const studentObj = user as Student;
      const userObj = user as User;
      const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      const validEmail = (userObj.email && userObj.email.includes('@') && !userObj.email.endsWith('.edu'))
        ? userObj.email
        : `${cleanUsername}@gmail.com`;

      const payload = {
        id: user.id,
        username: user.username.toLowerCase(),
        name: user.name,
        role: (user as User).role || (studentObj.studentId ? 'Student' : 'Teacher'),
        password: '[PROTECTED_AUTH]', // Passwords are exclusively encrypted in auth.users
        student_id: userObj.studentId || studentObj.studentId || null,
        grade_level: userObj.gradeLevel || studentObj.gradeLevel || null,
        section: userObj.section || studentObj.section || null,
        requested_class: userObj.requestedClass || studentObj.requestedClass || null,
        enrollment_status: userObj.enrollmentStatus || studentObj.enrollmentStatus || (userObj.role === 'Teacher' ? 'Enrolled' : 'Pending'),
        class_name: userObj.className || studentObj.className || 'Unassigned',
        class_id: userObj.classId || studentObj.classId || null,
        email: validEmail,
        avatar_text: userObj.avatarText || user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        updated_at: new Date().toISOString()
      };

      // 1. Upsert into public.users table (viewable under Table Editor > users)
      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseSync] User upsert warning:', error.message);
      }

      // 2. Also register in Supabase Auth (viewable under Authentication > Users)
      try {
        const authPassword = password || user.password || 'Examly2026!Secure';
        await supabase.auth.signUp({
          email: validEmail,
          password: authPassword,
          options: {
            data: {
              name: user.name,
              role: payload.role,
              username: user.username,
              student_id: payload.student_id,
              class_name: payload.class_name
            }
          }
        });
      } catch (authErr) {
        // Auth notice (may already exist or rate limited)
        console.warn('[SupabaseSync] Auth registration notice:', authErr);
      }

      return !error;
    } catch (err) {
      console.warn('[SupabaseSync] Network error syncing user:', err);
      return false;
    }
  },

  async fetchUsersFromCloud(): Promise<any[] | null> {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.warn('[SupabaseSync] Fetch users warning:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[SupabaseSync] Network error fetching users:', err);
      return null;
    }
  },

  // --- CLASSROOMS SYNC ---
  async syncClassroomToCloud(cls: ClassGroup): Promise<boolean> {
    try {
      const payload = {
        id: cls.id,
        name: cls.name,
        academic_year: cls.academicYear,
        student_count: cls.studentCount || 0,
        grade_level: cls.gradeLevel || null,
        teacher_username: cls.teacherUsername || null
      };

      const { error } = await supabase.from('classrooms').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseSync] Classroom upsert warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[SupabaseSync] Network error syncing classroom:', err);
      return false;
    }
  },

  async fetchClassroomsFromCloud(): Promise<any[] | null> {
    try {
      const { data, error } = await supabase.from('classrooms').select('*');
      if (error) {
        console.warn('[SupabaseSync] Fetch classrooms warning:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[SupabaseSync] Network error fetching classrooms:', err);
      return null;
    }
  },

  async deleteClassroomFromCloud(idOrName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .or(`id.eq.${idOrName},name.eq.${idOrName}`);
      if (error) {
        console.warn('[SupabaseSync] Delete classroom warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[SupabaseSync] Network error deleting classroom:', err);
      return false;
    }
  },

  // --- EXAMINATIONS SYNC ---
  async syncExamToCloud(exam: Examination): Promise<boolean> {
    try {
      const payload = {
        id: exam.id,
        code: exam.code || exam.id,
        title: exam.title,
        description: exam.description || '',
        subject: exam.subject,
        class_id: exam.classId,
        class_name: exam.className,
        assigned_class_names: exam.assignedClassNames || [],
        teacher_username: exam.teacherUsername || null,
        teacher_name: exam.teacherName || null,
        assigned_student_count: exam.assignedStudentCount || 0,
        assigned_student_ids: exam.assignedStudentIds || [],
        exam_date: exam.examDate,
        start_time: exam.startTime,
        duration: exam.duration,
        duration_minutes: exam.durationMinutes || 60,
        started_at: exam.startedAt || null,
        end_time: exam.endTime || null,
        is_paused: !!exam.isPaused,
        total_marks: exam.totalMarks || 100,
        instructions: exam.instructions || '',
        academic_term: exam.academicTerm || 'Term 1',
        status: exam.status,
        questions: exam.questions || [],
        results_released: !!exam.resultsReleased,
        created_at: exam.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('examinations').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseSync] Exam upsert warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[SupabaseSync] Network error syncing exam:', err);
      return false;
    }
  },

  async fetchExamsFromCloud(): Promise<any[] | null> {
    try {
      const { data, error } = await supabase.from('examinations').select('*');
      if (error) {
        console.warn('[SupabaseSync] Fetch exams warning:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[SupabaseSync] Network error fetching exams:', err);
      return null;
    }
  },

  // --- SUBMISSIONS SYNC ---
  async syncSubmissionToCloud(sub: ExaminationSubmission): Promise<boolean> {
    try {
      const payload = {
        id: sub.id,
        exam_id: sub.examId,
        student_id: sub.studentId,
        student_name: sub.studentName,
        student_username: sub.studentUsername,
        class_name: sub.className,
        score: sub.score,
        total_possible: sub.maxScore || 100,
        percentage: sub.percentage,
        answers: sub.answers,
        submitted_at: sub.submittedAt,
        status: sub.status
      };

      const { error } = await supabase.from('submissions').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[SupabaseSync] Submission upsert warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[SupabaseSync] Network error syncing submission:', err);
      return false;
    }
  },

  async fetchSubmissionsFromCloud(): Promise<any[] | null> {
    try {
      const { data, error } = await supabase.from('submissions').select('*');
      if (error) {
        console.warn('[SupabaseSync] Fetch submissions warning:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[SupabaseSync] Network error fetching submissions:', err);
      return null;
    }
  }
};
