import { User, UserRole, Student } from '../types';
import { storageService } from './storage.service';
import { SEED_TEACHERS } from '../data/seedData';

class AuthService {
  public getCurrentUser(roleHint?: UserRole): User | null {
    return storageService.getCurrentUser(roleHint);
  }

  public getCurrentTeacher(): User | null {
    return storageService.getCurrentTeacher();
  }

  public getCurrentStudent(): User | null {
    return storageService.getCurrentStudent();
  }

  public login(
    username: string,
    role: UserRole,
    password?: string
  ): { success: boolean; user?: User; message?: string } {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      return {
        success: false,
        message: 'Please enter your username.'
      };
    }

    if (role === 'Teacher') {
      const teachers = storageService.getTeachers();
      let found = teachers.find(t => t.username.toLowerCase() === cleanUsername);
      if (!found) {
        found = SEED_TEACHERS.find(t => t.username.toLowerCase() === cleanUsername);
      }

      if (!found) {
        // Check if username belongs to a Student account
        const students = storageService.getStudents();
        const asStudent = students.find(s => s.username.toLowerCase() === cleanUsername);
        if (asStudent) {
          return {
            success: false,
            message: `Account "${username}" is registered as a Student. Please switch to the Student Portal to sign in.`
          };
        }
        return {
          success: false,
          message: `Username "${username}" does not exist. Please check your username or click "Create account".`
        };
      }

      // Password verification
      if (!password || !password.trim()) {
        return {
          success: false,
          message: 'Please enter your password.'
        };
      }
      const expected = found.password || 'examly-demo';
      if (password !== expected) {
        return {
          success: false,
          message: 'Password is not correct. Please try again.'
        };
      }

      const user: User = {
        id: found.id,
        username: found.username,
        name: found.name,
        role: 'Teacher',
        avatarText: found.avatarText || found.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: found.email || `${found.username}@examly.edu`
      };

      storageService.saveCurrentTeacher(user);
      storageService.saveCurrentUser(user);
      storageService.addActivityLog({
        action: `${user.name} signed into the teacher workspace`,
        user: user.name,
        timestamp: 'Just now',
        color: 'blue'
      });
      return { success: true, user };
    } else {
      // Find in local student database: match Student ID first, then ID, then username for fallback
      const students = storageService.getStudents();
      const student = students.find(
        s =>
          (s.studentId && s.studentId.trim().toLowerCase() === cleanUsername) ||
          (s.id && s.id.trim().toLowerCase() === cleanUsername) ||
          s.username.trim().toLowerCase() === cleanUsername
      );

      if (!student) {
        // Check if username belongs to a Teacher account
        const teachers = storageService.getTeachers();
        const asTeacher = teachers.find(
          t => t.username.trim().toLowerCase() === cleanUsername || (t.email && t.email.trim().toLowerCase() === cleanUsername)
        );
        if (asTeacher) {
          return {
            success: false,
            message: `Account "${username}" is registered as a Teacher. Please switch to the Teacher Portal to sign in.`
          };
        }
        return {
          success: false,
          message: `Student ID "${username}" was not found. Please check your Student ID or click "Create account".`
        };
      }

      // Password verification
      if (!password || !password.trim()) {
        return {
          success: false,
          message: 'Please enter your password.'
        };
      }
      const expected = student.password || 'examly-demo';
      if (password !== expected) {
        return {
          success: false,
          message: 'Password is not correct. Please try again.'
        };
      }

      const user: User = {
        id: student.id,
        studentId: student.studentId,
        username: student.username,
        name: student.name,
        role: 'Student',
        avatarText: student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        classId: student.className,
        className: student.className,
        gradeLevel: student.gradeLevel,
        section: student.section,
        requestedClass: student.requestedClass,
        enrollmentStatus: student.enrollmentStatus || (student.className && student.className !== 'Unassigned' ? 'Enrolled' : 'Pending'),
        email: `${student.username}@examly.edu`
      };

      storageService.saveCurrentStudent(user);
      storageService.saveCurrentUser(user);
      storageService.addActivityLog({
        action: `${user.name} signed into the student portal`,
        user: user.name,
        timestamp: 'Just now',
        color: 'teal'
      });
      return { success: true, user };
    }
  }

  public registerTeacher(data: {
    name: string;
    username: string;
    password?: string;
  }): { success: boolean; user?: User; message?: string } {
    const cleanUsername = data.username.trim().toLowerCase();
    const teachers = storageService.getTeachers();

    if (
      teachers.some(t => t.username.toLowerCase() === cleanUsername) ||
      SEED_TEACHERS.some(t => t.username.toLowerCase() === cleanUsername)
    ) {
      return {
        success: false,
        message: `Username "${cleanUsername}" is already registered. Please choose another username or sign in.`
      };
    }

    const newTeacher = storageService.registerTeacher({
      name: data.name,
      username: cleanUsername,
      password: data.password
    });

    storageService.saveCurrentTeacher(newTeacher);
    storageService.saveCurrentUser(newTeacher);
    return { success: true, user: newTeacher };
  }

  public registerStudent(data: {
    name: string;
    studentId?: string;
    username: string;
    password?: string;
    gradeLevel?: string;
    section?: string;
    requestedClass?: string;
    className?: string;
  }): { success: boolean; user?: User; message?: string } {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanStudentId = data.studentId?.trim().toLowerCase();
    const students = storageService.getStudents();

    if (students.some(s => s.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        message: `Username "${cleanUsername}" is already registered. Please choose another username or sign in.`
      };
    }

    if (cleanStudentId && students.some(s => s.studentId && s.studentId.toLowerCase() === cleanStudentId)) {
      return {
        success: false,
        message: `Student ID "${data.studentId}" is already registered to another student. Please verify your ID.`
      };
    }

    const newStudent = storageService.registerStudent({
      ...data,
      username: cleanUsername
    });

    const user: User = {
      id: newStudent.id,
      studentId: newStudent.studentId,
      username: newStudent.username,
      name: newStudent.name,
      role: 'Student',
      avatarText: newStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      classId: newStudent.className,
      gradeLevel: newStudent.gradeLevel,
      section: newStudent.section,
      requestedClass: newStudent.requestedClass,
      enrollmentStatus: newStudent.enrollmentStatus,
      email: `${newStudent.username}@examly.edu`
    };

    storageService.saveCurrentStudent(user);
    storageService.saveCurrentUser(user);
    return { success: true, user };
  }

  public logout(roleToLogout?: UserRole): void {
    const targetRole = roleToLogout || storageService.getActiveRole();
    const user = targetRole === 'Teacher' ? storageService.getCurrentTeacher() : storageService.getCurrentStudent();
    if (user) {
      storageService.addActivityLog({
        action: `${user.name} signed out (${targetRole} portal)`,
        user: user.name,
        timestamp: 'Just now',
        color: 'orange'
      });
    }

    storageService.saveCurrentUser(null);
    storageService.saveCurrentTeacher(null);
    storageService.saveCurrentStudent(null);
  }

  public logoutAll(): void {
    storageService.saveCurrentTeacher(null);
    storageService.saveCurrentStudent(null);
    storageService.saveCurrentUser(null);
  }
}

export const authService = new AuthService();
