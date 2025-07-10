import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ARLoadingSkeleton: React.FC = () => {
  return (
    <div className="relative h-full w-full bg-black">
      {/* Top bar skeleton */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <Skeleton className="h-6 w-32 mb-2 bg-gray-600" />
          <Skeleton className="h-4 w-48 bg-gray-700" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg bg-gray-600" />
      </div>

      {/* Main content skeleton */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <Skeleton className="h-6 w-48 mx-auto mb-2 bg-gray-600" />
          <Skeleton className="h-4 w-32 mx-auto bg-gray-700" />
        </div>
      </div>

      {/* Bottom controls skeleton */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full bg-gray-600" />
          ))}
        </div>
      </div>

      {/* Bottom right guide skeleton */}
      <div className="absolute bottom-4 right-4 z-30">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <Skeleton className="h-4 w-24 mb-1 bg-gray-700" />
          <Skeleton className="h-4 w-20 mb-1 bg-gray-700" />
          <Skeleton className="h-4 w-16 bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export const ModelListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg border overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};