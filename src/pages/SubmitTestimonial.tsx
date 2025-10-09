import TestimonialForm from '@/components/TestimonialForm';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';

const SubmitTestimonial = () => {
  return (
    <>
      <SEOHead 
        title="Submit a Testimonial - Tonderai Matanga"
        description="Share your experience working with Tonderai Matanga. Submit a testimonial about our collaboration."
        url="https://iamtonde.co.za/submit-testimonial"
      />
      <Navigation />
      <TestimonialForm />
    </>
  );
};

export default SubmitTestimonial;