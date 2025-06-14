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

type StudentProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

export const getUniqueStudents = (
  studentProgress: StudentProgress[],
  studentProfiles: StudentProfile[]
) => {
  // Map student progress by student_id
  const progressByStudent = new Map<string, StudentProgress[]>();
  studentProgress.forEach(progress => {
    if (!progressByStudent.has(progress.student_id)) {
      progressByStudent.set(progress.student_id, []);
    }
    progressByStudent.get(progress.student_id)!.push(progress);
  });

  // Build the array to include ALL studentProfiles
  const students = studentProfiles.map(profile => {
    const progressArr = progressByStudent.get(profile.id) || [];
    const totalTopics = progressArr.length;
    const totalProgress = progressArr.reduce(
      (acc, p) => acc + (p.progress_percentage || 0),
      0
    );
    const completedTopics = progressArr.filter(
      p => p.progress_percentage === 100
    ).length;
    const averageProgress =
      totalTopics > 0
        ? Math.round(totalProgress / totalTopics)
        : 0;

    return {
      id: profile.id,
      name: profile.full_name || 'No name',
      email: profile.email || 'No email',
      totalProgress,
      completedTopics,
      totalTopics,
      averageProgress
    };
  });

  return students;
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
