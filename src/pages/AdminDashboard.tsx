import AdminTestimonials from '@/pages/AdminTestimonials';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';

const AdminDashboard = () => {
  return (
    <>
      <SEOHead 
        title="Admin Dashboard - Tonderai Matanga"
        description="Admin dashboard for managing testimonials and content"
        url="https://iamtonde.co.za/admin/testimonials"
      />
      <Navigation />
      <AdminTestimonials />
    </>
  );
};

export default AdminDashboard;