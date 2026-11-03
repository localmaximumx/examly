import { User, UserRole, Student } from '../types';
import { storageService } from './storage.service';
import { SEED_TEACHERS } from '../data/seedData';

class AuthService {
  public getCurrentUser(): User | null {
    return storageService.getCurrentUser();
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
        return {
          success: false,
          message: `No teacher account found with username "${username}". Please click "Create account" to register.`
        };
      }

      // Password verification if password is provided
      if (password !== undefined) {
        if (!password.trim()) {
          return {
            success: false,
            message: 'Please enter your password.'
          };
        }
        const expected = found.password || 'examly-demo';
        if (password !== expected) {
          return {
            success: false,
            message: 'Incorrect password. Please verify your credentials and try again.'
          };
        }
      }

      const user: User = {
        id: found.id,
        username: found.username,
        name: found.name,
        role: 'Teacher',
        avatarText: found.avatarText || found.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: found.email || `${found.username}@examly.edu`
      };

      storageService.saveCurrentUser(user);
      storageService.addActivityLog({
        action: `${user.name} signed into the teacher workspace`,
        user: user.name,
        timestamp: 'Just now',
        color: 'blue'
      });
      return { success: true, user };
    } else {
      // Find in local student database
      const students = storageService.getStudents();
      const student = students.find(s => s.username.toLowerCase() === cleanUsername);

      if (!student) {
        return {
          success: false,
          message: `No student account found with username "${username}". Please click "Create account" to register.`
        };
      }

      // Password verification if password is provided
      if (password !== undefined) {
        if (!password.trim()) {
          return {
            success: false,
            message: 'Please enter your password.'
          };
        }
        const expected = student.password || 'examly-demo';
        if (password !== expected) {
          return {
            success: false,
            message: 'Incorrect password. Please verify your credentials and try again.'
          };
        }
      }

      const user: User = {
        id: student.id,
        studentId: student.studentId,
        username: student.username,
        name: student.name,
        role: 'Student',
        avatarText: student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        classId: student.className,
        gradeLevel: student.gradeLevel,
        section: student.section,
        email: `${student.username}@examly.edu`
      };

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
      email: `${newStudent.username}@examly.edu`
    };

    storageService.saveCurrentUser(user);
    return { success: true, user };
  }

  public logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      storageService.addActivityLog({
        action: `${user.name} logged out`,
        user: user.name,
        timestamp: 'Just now',
        color: 'orange'
      });
    }
    storageService.saveCurrentUser(null);
  }
}

export const authService = new AuthService();
