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
  title = "Tonderai Matanga | Full-Stack Developer",
  description = "Full-stack developer building React, TypeScript, and product-focused web applications. Case studies, live GitHub work, and contact details.",
  url = "https://iamtonde.co.za",
  image = "/og-image.jpg",
  type = "website",
  keywords = "full-stack developer, React developer, TypeScript developer, web application developer, developer portfolio, case studies",
  noIndex = false,
}: SEOHeadProps) => {
  const robotsContent = noIndex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  
  // Enhanced Person Schema with GEO and professional details
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Tonderai Matanga",
    "givenName": "Tonderai",
    "familyName": "Matanga",
    "jobTitle": "Full Stack Developer & UI/UX Designer",
    "description": description,
    "url": url,
    "image": {
      "@type": "ImageObject",
      "url": `${url}${image}`,
      "width": 1200,
      "height": 630
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cape Town",
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    },
    "email": PROFILE.email,
    "sameAs": [
      ...PROFILE_SAME_AS_URLS
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance Developer"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Full Stack Developer",
      "occupationalCategory": "Software Development",
      "skills": [
        "React", "TypeScript", "JavaScript", "Node.js", "Python", 
        "Next.js", "Vue.js", "Express.js", "PostgreSQL", "MongoDB",
        "UI/UX Design", "Tailwind CSS", "GraphQL", "REST APIs"
      ]
    },
    "knowsAbout": [
      "React Development", "TypeScript Programming", "Node.js Backend Development",
      "Python Programming", "Full Stack Development", "UI/UX Design",
      "Frontend Development", "Backend Development", "Web Application Development",
      "Database Design", "API Development", "Responsive Web Design"
    ],
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Full Stack Development Services",
        "description": "Custom web application development, UI/UX design, and technical consulting services"
      },
      "areaServed": ["South Africa", "Global Remote Work"],
      "availability": "Available for freelance projects"
    }
  };

  // Website Schema for better understanding
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tonderai Matanga - Developer Portfolio",
    "url": url,
    "description": description,
    "author": {
      "@type": "Person",
      "name": "Tonderai Matanga"
    },
    "inLanguage": "en-US",
    "copyrightYear": new Date().getFullYear(),
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/#projects?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // FAQ Schema for AEO optimization
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What programming languages does Tonderai specialize in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tonderai specializes in TypeScript, JavaScript, Python, and modern web development technologies including React, Node.js, and Next.js."
        }
      },
      {
        "@type": "Question", 
        "name": "Is Tonderai available for freelance development projects?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Tonderai is available for freelance full-stack development projects, both locally in South Africa and remotely worldwide."
        }
      },
      {
        "@type": "Question",
        "name": "What types of web applications can Tonderai develop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tonderai can develop modern web applications, e-commerce platforms, progressive web apps, custom dashboards, and enterprise solutions using React, TypeScript, and Node.js."
        }
      }
    ]
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
      <meta property="og:image:alt" content="Tonderai Matanga - Full Stack Developer Portfolio" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="Tonderai Matanga Portfolio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta name="twitter:image:alt" content="Tonderai Matanga - Full Stack Developer Portfolio" />
      
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
          <script type="application/ld+json">
            {JSON.stringify(personSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(websiteSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        </>
      )}
    </Helmet>
  );
};

export default SEOHead;
