import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface AdvancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'profile';
}

/**
 * Advanced SEO Component - Senior-level implementation
 * 
 * Features:
 * - Dynamic meta tags with proper OG and Twitter card support
 * - JSON-LD structured data for rich snippets
 * - Canonical URLs for duplicate content prevention
 * - Preconnect to external domains for performance
 * - Mobile-optimized viewport settings
 */
const AdvancedSEO = ({
  title = 'Tonderai Matanga - Full Stack Developer',
  description = 'Senior Full Stack Developer specializing in React, TypeScript, Node.js, and modern web technologies. Building scalable, performant web applications.',
  keywords = 'Full Stack Developer, React Developer, TypeScript, Node.js, Web Development, Frontend Development, Backend Development, Tonderai Matanga',
  ogImage = '/og-image.jpg',
  canonicalUrl = 'https://iamtonde.co.za',
  type = 'website'
}: AdvancedSEOProps) => {
  
  useEffect(() => {
    // Performance optimization: Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tonderai Matanga',
    jobTitle: 'Full Stack Developer',
    url: canonicalUrl,
    image: `${canonicalUrl}${ogImage}`,
    sameAs: [
      'https://github.com/dev-tonde',
      'https://www.linkedin.com/in/tonderai-matanga/',
    ],
    knowsAbout: [
      'React',
      'TypeScript',
      'Node.js',
      'Web Development',
      'Frontend Development',
      'Backend Development',
      'Full Stack Development',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Next.js',
      'PostgreSQL',
      'Supabase'
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Tonderai Matanga" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${canonicalUrl}${ogImage}`} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Tonderai Matanga Portfolio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${canonicalUrl}${ogImage}`} />
      <meta name="twitter:creator" content="@tonderai" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#a855f7" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Performance Hints */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default AdvancedSEO;
