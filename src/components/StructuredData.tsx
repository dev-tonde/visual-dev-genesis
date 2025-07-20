import { Helmet } from 'react-helmet-async';

const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Tonderai",
    "url": "https://iamtonde.co.za",
    "image": "https://iamtonde.co.za/og-image.jpg",
    "jobTitle": "Full Stack Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "University"
    },
    "knowsAbout": [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "Full Stack Development",
      "Web Development",
      "Software Engineering"
    ],
    "sameAs": [
      "https://github.com/tonderai",
      "https://linkedin.com/in/tonderai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@iamtonde.co.za",
      "contactType": "Professional"
    }
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "Website",
    "name": "Tonderai - Full Stack Developer",
    "url": "https://iamtonde.co.za",
    "description": "Professional portfolio showcasing full stack development projects and expertise in React, TypeScript, and modern web technologies.",
    "author": {
      "@type": "Person",
      "name": "Tonderai"
    },
    "inLanguage": "en-US"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;