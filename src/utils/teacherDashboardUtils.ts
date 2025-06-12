
type StudentProgress = {
  id: string;
  student_id: string;
  module_id: string;
  topic_id: string;
  progress_percentage: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  topic_title?: string;
  module_title?: string;
  student_name?: string;
  student_email?: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  is_active: boolean;
};

export const getUniqueStudents = (studentProgress: StudentProgress[]) => {
  const uniqueStudents = new Map();
  studentProgress.forEach(progress => {
    if (!uniqueStudents.has(progress.student_id)) {
      uniqueStudents.set(progress.student_id, {
        id: progress.student_id,
        name: progress.student_name || 'No name',
        email: progress.student_email || 'No email',
        totalProgress: 0,
        completedTopics: 0,
        totalTopics: 0
      });
    }
    
    const student = uniqueStudents.get(progress.student_id);
    student.totalTopics += 1;
    student.totalProgress += progress.progress_percentage;
    if (progress.progress_percentage === 100) {
      student.completedTopics += 1;
    }
  });

  // Calculate average progress
  uniqueStudents.forEach(student => {
    student.averageProgress = student.totalTopics > 0 ? 
      Math.round(student.totalProgress / student.totalTopics) : 0;
  });

  return Array.from(uniqueStudents.values());
};

export const getModuleStats = (modules: Module[], studentProgress: StudentProgress[]) => {
  const moduleStats = new Map();
  
  modules.forEach(module => {
    moduleStats.set(module.id, {
      ...module,
      totalStudents: 0,
      completedCount: 0,
      inProgressCount: 0
    });
  });

  studentProgress.forEach(progress => {
    if (moduleStats.has(progress.module_id)) {
      const stats = moduleStats.get(progress.module_id);
      stats.totalStudents += 1;
      if (progress.progress_percentage === 100) {
        stats.completedCount += 1;
      } else if (progress.progress_percentage > 0) {
        stats.inProgressCount += 1;
      }
    }
  });

  return Array.from(moduleStats.values());
};
