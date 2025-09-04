import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/placeholder.svg",
      rating: 5,
      content: "Tonderai delivered exceptional work on our web application. His attention to detail and technical expertise made the project a huge success. Highly recommend!"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "StartupXYZ",
      avatar: "/placeholder.svg",
      rating: 5,
      content: "Working with Tonderai was a fantastic experience. He not only met all our requirements but also provided valuable insights that improved our overall product."
    },
    {
      name: "Emily Rodriguez",
      role: "Design Lead",
      company: "Creative Agency",
      avatar: "/placeholder.svg",
      rating: 5,
      content: "Tonderai's ability to translate design concepts into beautiful, functional websites is remarkable. He's a true professional and a pleasure to work with."
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-muted/30">
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

          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    className="w-full flex-shrink-0 px-4"
                    variants={itemVariants}
                  >
                    <Card className="glass-vibrant border-0 relative overflow-hidden hover-glow transition-all duration-500 mx-auto max-w-2xl">
                      <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                          <div className="flex space-x-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
                        
                        <p className="text-lg text-muted-foreground mb-8 italic leading-relaxed">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <Avatar className="ring-2 ring-primary/20 w-16 h-16">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback className="bg-primary/10 text-lg">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.role} at {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 glass-vibrant border-0 hover-lift"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 glass-vibrant border-0 hover-lift"
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted hover:bg-primary/50'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            {/* Auto-play Toggle */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {isAutoPlaying ? 'Pause' : 'Resume'} auto-play
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;