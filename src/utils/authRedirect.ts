
export const redirectBasedOnRole = (role: string) => {
  const currentPath = window.location.pathname;
  
  // Don't redirect if already on a dashboard or auth page
  if (currentPath.includes('dashboard') || currentPath.includes('auth')) {
    return;
  }

  console.log('Redirecting based on role:', role);
  
  switch (role) {
    case 'student':
      window.location.href = '/student-dashboard';
      break;
    case 'admin':
    case 'client':
      window.location.href = '/admin-dashboard';
      break;
    case 'teacher':
      window.location.href = '/teacher-dashboard';
      break;
    default:
      console.log('Unknown role, staying on current page');
      break;
  }
};
