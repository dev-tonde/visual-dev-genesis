import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="glass border-0 h-full hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <div className="relative mb-6">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                      <p className="text-muted-foreground leading-relaxed pl-6">
                        {testimonial.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;