import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const SEOHead = ({ 
  title = "Tonderai - Full Stack Developer & UI/UX Designer",
  description = "Passionate full-stack developer specializing in React, TypeScript, and modern web technologies. Creating exceptional digital experiences with clean code and beautiful design.",
  url = "https://iamtonde.co.za",
  image = "/og-image.jpg"
}: SEOHeadProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Tonderai",
    "jobTitle": "Full Stack Developer",
    "description": description,
    "url": url,
    "image": image,
    "sameAs": [
      "https://github.com/tonderai",
      "https://linkedin.com/in/tonderai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@iamtonde.co.za",
      "contactType": "Professional"
    },
    "knowsAbout": [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "UI/UX Design",
      "Full Stack Development"
    ]
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="Full Stack Developer, React, TypeScript, Next.js, UI/UX Design, Web Development, Tonderai" />
      <meta name="author" content="Tonderai" />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Tonderai Portfolio" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;