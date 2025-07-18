import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

const LazyImage = ({ src, alt, className = '', placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`lazy-image ${isLoaded ? 'loaded' : ''} ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover ${className}`}
          style={{
            filter: isLoaded ? 'none' : 'blur(4px)',
            transition: 'filter 0.3s ease-in-out',
          }}
        />
      )}
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;