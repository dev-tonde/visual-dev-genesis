import { Helmet } from 'react-helmet-async';

const StructuredData = () => {
  // Enhanced Professional Service Schema
  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Tonderai Matanga - Full Stack Development Services",
    "description": "Professional full-stack web development services specializing in React, TypeScript, Node.js, and modern web technologies",
    "url": "https://iamtonde.co.za",
    "telephone": "+27-XXX-XXX-XXXX",
    "email": "hello@iamtonde.co.za",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cape Town",
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.9249,
      "longitude": 18.4241
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "South Africa"
      },
      {
        "@type": "Place",
        "name": "Global Remote Services"
      }
    ],
    "serviceType": "Web Development",
    "provider": {
      "@type": "Person",
      "name": "Tonderai Matanga",
      "jobTitle": "Full Stack Developer"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "React Development",
            "description": "Custom React application development with TypeScript"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Full Stack Development",
            "description": "End-to-end web application development with modern technologies"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "UI/UX Design",
            "description": "User interface and experience design for web applications"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "12",
      "bestRating": "5",
      "worstRating": "4"
    }
  };

  // Organization Schema for business entity
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tonderai Matanga Development",
    "alternateName": "dev-tonde",
    "url": "https://iamtonde.co.za",
    "logo": {
      "@type": "ImageObject",
      "url": "https://iamtonde.co.za/og-image.jpg"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+27-XXX-XXX-XXXX",
      "contactType": "customer service",
      "email": "hello@iamtonde.co.za",
      "areaServed": "ZA",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cape Town",
      "addressRegion": "Western Cape", 
      "addressCountry": "ZA"
    },
    "sameAs": [
      "https://github.com/dev-tonde",
      "https://www.linkedin.com/in/tonderai-matanga/",
      "https://twitter.com/dev_tonde"
    ],
    "founder": {
      "@type": "Person",
      "name": "Tonderai Matanga"
    }
  };

  // LocalBusiness Schema for GEO SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Tonderai Matanga - Web Developer Cape Town",
    "image": "https://iamtonde.co.za/og-image.jpg",
    "url": "https://iamtonde.co.za",
    "telephone": "+27-XXX-XXX-XXXX",
    "email": "hello@iamtonde.co.za",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cape Town",
      "addressLocality": "Cape Town",
      "addressRegion": "WC",
      "postalCode": "8000",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.9249,
      "longitude": 18.4241
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    "priceRange": "$$"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(professionalServiceSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;