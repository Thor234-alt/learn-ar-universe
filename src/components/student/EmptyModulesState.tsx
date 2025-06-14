
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const EmptyModulesState = () => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
        <p className="text-gray-600">
          Check back later for new learning modules.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyModulesState;
