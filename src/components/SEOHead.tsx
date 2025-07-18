import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const SEOHead = ({ 
  title = "Tonderai - Full-Stack Developer & UI/UX Designer",
  description = "Experienced full-stack developer specializing in React, TypeScript, Node.js, and modern web technologies. Available for freelance projects and consulting.",
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
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="full-stack developer, React developer, TypeScript, Node.js, UI/UX design, web development, freelance developer, South Africa developer" />
      <meta name="author" content="Tonderai" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Tonderai Portfolio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${url}${image}`} />
      <meta property="twitter:creator" content="@yourtwitterhandle" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="color-scheme" content="dark light" />
      
      {/* Performance hints */}
      <link rel="dns-prefetch" href="//api.github.com" />
      <link rel="dns-prefetch" href="//supabase.co" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;