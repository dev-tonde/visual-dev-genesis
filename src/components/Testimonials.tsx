import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Testimonial {
  id: string;
  user_id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  profile_picture_url: string | null;
  profiles: {
    full_name: string;
  };
}

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        user_id,
        name,
        title,
        company,
        content,
        profile_picture_url,
        profiles!testimonials_user_id_fkey (
          full_name
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      setTestimonials(data as any);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };


  return (
    <section id="testimonials" className="px-4 bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take my word for it. Here's what some of my clients have to say about working with me.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No testimonials yet. Be the first to share your experience!</p>
              <Button onClick={() => navigate('/submit-testimonial')}>
                Submit Testimonial
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="glass-vibrant border-0 relative overflow-hidden hover-glow transition-all duration-500 h-full">
                      <CardContent className="p-6 text-center h-full flex flex-col">
                        <div className="flex justify-center mb-4">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <Quote className="w-8 h-8 text-primary/30 mx-auto mb-4" />
                        
                        <p className="text-sm text-muted-foreground mb-6 italic leading-relaxed flex-grow">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="flex items-center justify-center space-x-3">
                          <Avatar className="ring-2 ring-primary/20 w-12 h-12">
                            <AvatarImage src={testimonial.profile_picture_url || ''} alt={testimonial.name} />
                            <AvatarFallback className="bg-primary/10">
                              {testimonial.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <h4 className="font-semibold text-sm">{testimonial.name || 'Anonymous'}</h4>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.title} at {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button onClick={() => navigate('/submit-testimonial')} variant="outline">
                  Submit Your Testimonial
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;