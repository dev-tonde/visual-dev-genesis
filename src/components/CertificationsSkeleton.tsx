import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CertificationsSkeleton = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-80 mx-auto mb-6" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass border-0">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="w-24 h-6 rounded-full" />
                </div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  
                  <Skeleton className="h-9 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSkeleton;
