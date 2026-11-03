import { Student, ClassGroup } from '../types';
import { storageService } from './storage.service';

class StudentService {
  public getAllStudents(): Student[] {
    return storageService.getStudents();
  }

  public getStudentsByClass(className: string): Student[] {
    return this.getAllStudents().filter(s => s.className === className);
  }

  public searchStudents(query: string, filterClass?: string): Student[] {
    const students = this.getAllStudents();
    const cleanQuery = query.toLowerCase().trim();

    return students.filter(s => {
      const matchQuery = !cleanQuery ||
        s.name.toLowerCase().includes(cleanQuery) ||
        s.studentId.toLowerCase().includes(cleanQuery) ||
        s.username.toLowerCase().includes(cleanQuery);

      const matchClass = !filterClass || filterClass === 'All' || s.className === filterClass;
      return matchQuery && matchClass;
    });
  }

  public addStudent(studentData: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...studentData,
      id: `STU-${Date.now().toString().slice(-4)}`
    };
    storageService.saveStudent(newStudent);
    storageService.addActivityLog({
      action: `Student account ${newStudent.studentId} (${newStudent.name}) was created`,
      user: storageService.getCurrentUser()?.name || 'Teacher',
      timestamp: 'Just now',
      color: 'orange'
    });
    return newStudent;
  }

  public updateStudent(student: Student): Student {
    storageService.saveStudent(student);
    return student;
  }

  public toggleConnection(studentId: string): void {
    const students = this.getAllStudents();
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    if (student) {
      student.connectionStatus = student.connectionStatus === 'Connected' ? 'Disconnected' : 'Connected';
      storageService.saveStudent(student);
    }
  }

  public getAllClasses(): ClassGroup[] {
    return storageService.getClasses();
  }

  public addClass(classData: Omit<ClassGroup, 'id'>): ClassGroup {
    const newClass: ClassGroup = {
      ...classData,
      id: `CLS-${Date.now().toString().slice(-4)}`
    };
    const classes = this.getAllClasses();
    classes.push(newClass);
    storageService.saveClasses(classes);
    return newClass;
  }
}

export const studentService = new StudentService();
