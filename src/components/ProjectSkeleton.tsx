import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectSkeleton = () => {
  return (
    <Card className="glass border-0 h-full" style={{ minHeight: '380px' }}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        
        <div className="flex space-x-3 pt-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSkeleton;