
// Utility for aggregating student and module stats

type StudentProgress = {
  id: string;
  student_id: string;
  module_id: string;
  topic_id: string | null;
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
 * Returns only students who have at least one progress record
 * and aggregates their total/average progress.
 */
export const getUniqueStudents = (
  studentProgress: StudentProgress[],
  studentProfiles: StudentProfile[]
) => {
  // Get all students that have at least one progress entry
  const studentsWithProgressSet = new Set<string>();
  studentProgress.forEach((p) => {
    studentsWithProgressSet.add(p.student_id);
  });

  // For every matching profile, summarize their info
  const students = studentProfiles
    .filter(profile => studentsWithProgressSet.has(profile.id))
    .map(profile => {
      const progressArr = studentProgress.filter(
        (p) => p.student_id === profile.id
      );
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

/**
 * Aggregates, per module, unique students (with progress), and their completion/in-progress stats
 */
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

  // Per module: Set of student_ids, per-student max progress per module
  const moduleStudentProgress = new Map<string, Map<string, number>>();
  studentProgress.forEach(p => {
    if (!moduleStudentProgress.has(p.module_id)) {
      moduleStudentProgress.set(p.module_id, new Map());
    }
    const studentP = moduleStudentProgress.get(p.module_id)!;
    // Track max progress (percentage) per student per module
    if (!studentP.has(p.student_id)) {
      studentP.set(p.student_id, p.progress_percentage || 0);
    } else {
      studentP.set(
        p.student_id,
        Math.max(studentP.get(p.student_id)!, p.progress_percentage || 0)
      );
    }
  });

  moduleStats.forEach((stat, moduleId) => {
    const studentMap = moduleStudentProgress.get(moduleId) || new Map();
    let completed = 0;
    let inProgress = 0;
    for (const progress of [...studentMap.values()]) {
      if (progress === 100) completed++;
      else if (progress > 0) inProgress++;
    }
    stat.totalStudents = studentMap.size;
    stat.completedCount = completed;
    stat.inProgressCount = inProgress;
  });

  return Array.from(moduleStats.values());
};
