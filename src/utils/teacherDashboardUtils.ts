
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

/**
 * Returns all student profiles (not just those with progress).
 * Appends summary progress info by aggregating all progress rows.
 */
export const getUniqueStudents = (
  studentProgress: StudentProgress[],
  studentProfiles: StudentProfile[]
) => {
  // Map student progress by student_id (group all progress by each student)
  const progressByStudent = new Map<string, StudentProgress[]>();
  studentProgress.forEach(progress => {
    if (!progressByStudent.has(progress.student_id)) {
      progressByStudent.set(progress.student_id, []);
    }
    progressByStudent.get(progress.student_id)!.push(progress);
  });

  // For every profile (not filtered by progress), summarize their info
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
    // Total number of topics assigned in the system:
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

/**
 * For every module, aggregate unique students and their completion/in progress stats based on distinct student_ids
 */
export const getModuleStats = (modules: Module[], studentProgress: StudentProgress[]) => {
  // Build `moduleStats` map by module.id
  const moduleStats = new Map();

  modules.forEach(module => {
    moduleStats.set(module.id, {
      ...module,
      totalStudents: 0,
      completedCount: 0,
      inProgressCount: 0
    });
  });

  // For every module, collect a set of unique student_ids and their max progress
  const moduleStudentProgressMap = new Map<string, Map<string, number>>(); // moduleId => Map<studentId, max_progress_percentage>
  studentProgress.forEach(progress => {
    if (!moduleStudentProgressMap.has(progress.module_id)) {
      moduleStudentProgressMap.set(progress.module_id, new Map());
    }
    const studentMap = moduleStudentProgressMap.get(progress.module_id)!;
    // Track max progress per student per module
    const existing = studentMap.get(progress.student_id) || 0;
    studentMap.set(progress.student_id, Math.max(existing, progress.progress_percentage || 0));
  });

  // Now aggregate per-module
  moduleStats.forEach((stats, moduleId) => {
    const studentMap = moduleStudentProgressMap.get(moduleId) || new Map();
    stats.totalStudents = studentMap.size;
    let completed = 0;
    let inProgress = 0;
    studentMap.forEach(progress => {
      if (progress === 100) completed++;
      else if (progress > 0) inProgress++;
    });
    stats.completedCount = completed;
    stats.inProgressCount = inProgress;
  });

  return Array.from(moduleStats.values());
};

