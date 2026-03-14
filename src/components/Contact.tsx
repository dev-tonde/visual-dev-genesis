import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import SectionHeading from '@/components/SectionHeading';

const Contact = () => {
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

  return (
    <section id="contact" className="section-shell section-anchor px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <SectionHeading
              label="Contact"
              title="Start a Conversation"
              description="If you need a product-minded engineer for a web app, front-end rebuild, or working prototype, send the brief. I reply with scope, tradeoffs, and next steps."
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <ContactForm variants={itemVariants} />
            <ContactInfo variants={itemVariants} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
