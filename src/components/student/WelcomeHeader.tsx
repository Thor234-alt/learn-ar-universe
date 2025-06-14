
import { useAuth } from '@/hooks/useAuth';

const WelcomeHeader = () => {
  const { user, profile } = useAuth();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {profile?.full_name || user?.email}!
      </h1>
      <p className="text-gray-600">Continue your learning journey</p>
    </div>
  );
};

export default WelcomeHeader;
