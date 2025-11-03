import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AboutSkeleton = () => {
  return (
    <section className="py-20 px-4" style={{ minHeight: '700px' }}>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-6" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* What I Do Section */}
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quote */}
          <Card className="glass border-0 mb-12">
            <CardContent className="p-8">
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </CardContent>
          </Card>

          {/* Skills Visualization Placeholder */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-56 mx-auto" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSkeleton;
