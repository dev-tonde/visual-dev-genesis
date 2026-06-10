import { Helmet } from 'react-helmet-async';
import { PROFILE, PROFILE_SAME_AS_URLS } from '@/config/profile';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  keywords?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title = 'Tonderai Matanga | Senior Front-End Developer',
  description = 'Senior front-end developer with 8+ years of experience building accessible, high-performance web experiences with React, TypeScript, Next.js, WordPress, and Drupal. Case studies, live GitHub work, and contact details.',
  url = 'https://iamtonde.co.za',
  image = '/og-image.jpg',
  type = 'website',
  keywords = 'senior front-end developer, front-end engineer, React developer, TypeScript developer, Next.js developer, WordPress developer, Drupal theming, web accessibility, developer portfolio, case studies',
  noIndex = false,
}: SEOHeadProps) => {
  const robotsContent = noIndex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  // Enhanced Person Schema with GEO and professional details
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tonderai Matanga',
    givenName: 'Tonderai',
    familyName: 'Matanga',
    jobTitle: 'Senior Front-End Developer',
    description: description,
    url: url,
    image: {
      '@type': 'ImageObject',
      url: `${url}${image}`,
      width: 1200,
      height: 630,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cape Town',
      addressRegion: 'Western Cape',
      addressCountry: 'ZA',
    },
    email: PROFILE.email,
    sameAs: [...PROFILE_SAME_AS_URLS],
    worksFor: {
      '@type': 'Organization',
      name: 'Retail Capital (TymeBank)',
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Senior Front-End Developer',
      occupationalCategory: 'Software Development',
      skills: [
        'React',
        'TypeScript',
        'JavaScript (ES6+)',
        'Next.js',
        'Vue',
        'Svelte',
        'HTML5',
        'CSS3/SASS',
        'Tailwind CSS',
        'WordPress',
        'Drupal (Twig theming)',
        'PHP',
        'REST APIs',
        'GraphQL',
        'Accessibility (WCAG 2.1)',
        'Performance Optimisation',
        'CI/CD',
      ],
    },
    knowsAbout: [
      'Front-End Development',
      'React Development',
      'TypeScript Programming',
      'Next.js and Server-Side Rendering',
      'WordPress Theme Development',
      'Drupal Twig Theming',
      'Web Accessibility (WCAG 2.1)',
      'Performance Optimisation and Core Web Vitals',
      'Component Systems and Design Systems',
      'REST and GraphQL API Integration',
      'Automated Testing (Jest, React Testing Library, Cypress, Playwright)',
      'CI/CD Pipelines',
      'Responsive Web Design',
    ],
  };

  // Website Schema for better understanding
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tonderai Matanga - Developer Portfolio',
    url: url,
    description: description,
    author: {
      '@type': 'Person',
      name: 'Tonderai Matanga',
    },
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/#projects?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Enhanced Meta Tags for SEO/AEO/GEO */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Tonderai Matanga" />
      <meta name="robots" content={robotsContent} />

      {/* Canonical and Hreflang */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Enhanced Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:image:secure_url" content={`${url}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Tonderai Matanga - Senior Front-End Developer Portfolio"
      />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="Tonderai Matanga Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta
        name="twitter:image:alt"
        content="Tonderai Matanga - Senior Front-End Developer Portfolio"
      />

      {/* App and Performance Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="color-scheme" content="dark light" />
      <meta name="apple-mobile-web-app-title" content="Tonderai Portfolio" />
      <meta name="application-name" content="Tonderai Portfolio" />

      {/* Accessibility and Performance */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />

      {/* Structured Data Schemas */}
      {!noIndex && (
        <>
          <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        </>
      )}
    </Helmet>
  );
};

export default SEOHead;
