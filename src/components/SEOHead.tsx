import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  keywords?: string;
}

const SEOHead = ({ 
  title = "Tonderai Matanga - Full-Stack Developer & UI/UX Designer | React & TypeScript Expert",
  description = "Expert full-stack developer in Cape Town, South Africa. Specializing in React, TypeScript, Node.js, Python, and modern web technologies. Available for freelance projects, consulting, and remote development work. Portfolio showcasing innovative web applications and UI/UX design.",
  url = "https://iamtonde.co.za",
  image = "/og-image.jpg",
  type = "website",
  keywords = "full-stack developer Cape Town, React developer South Africa, TypeScript expert, Node.js developer, Python programmer, UI/UX designer, freelance developer, remote work, web development portfolio, modern web technologies, JavaScript developer, frontend backend developer"
}: SEOHeadProps) => {
  
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
    "email": "hello@iamtonde.co.za",
    "sameAs": [
      "https://github.com/dev-tonde",
      "https://www.linkedin.com/in/tonderai-matanga/",
      "https://twitter.com/dev_tonde"
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
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Geographic SEO */}
      <meta name="geo.region" content="ZA-WC" />
      <meta name="geo.placename" content="Cape Town" />
      <meta name="geo.position" content="-33.9249;18.4241" />
      <meta name="ICBM" content="-33.9249, 18.4241" />
      <meta name="DC.title" content={title} />
      <meta name="DC.creator" content="Tonderai Matanga" />
      <meta name="DC.subject" content="Full Stack Development, Web Development, React, TypeScript" />
      <meta name="DC.description" content={description} />
      
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
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta name="twitter:image:alt" content="Tonderai Matanga - Full Stack Developer Portfolio" />
      <meta name="twitter:creator" content="@dev_tonde" />
      <meta name="twitter:site" content="@dev_tonde" />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="tonderai-matanga" />
      
      {/* App and Performance Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="color-scheme" content="dark light" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Tonderai Portfolio" />
      <meta name="application-name" content="Tonderai Portfolio" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Accessibility and Performance */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      
      {/* Preconnect and DNS Prefetch for Performance */}
      <link rel="preconnect" href="//fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="//api.github.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//supabase.co" />
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      
      {/* Resource Hints */}
      <link rel="prefetch" href="/cv.pdf" />
      <link rel="preload" href="/assets/hero-bg.jpg" as="image" />
      
      {/* Structured Data Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;