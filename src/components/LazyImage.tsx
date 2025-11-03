import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

const LazyImage = ({ src, alt, className = '', placeholder, width, height, aspectRatio = '16/9' }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image ${isLoaded ? 'loaded' : ''} ${className} relative`}
      style={{
        aspectRatio: aspectRatio,
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {isInView && (
        <picture>
          <source 
            srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`} 
            type="image/webp" 
          />
          <source 
            srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '.avif')}`} 
            type="image/avif" 
          />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover ${className}`}
            style={{
              filter: isLoaded ? 'none' : 'blur(4px)',
              transition: 'filter 0.3s ease-in-out',
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            role="img"
            aria-label={alt}
            itemProp="image"
          />
        </picture>
      )}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          aria-hidden="true"
        >
          {placeholder && <span className="text-muted-foreground text-sm">{placeholder}</span>}
        </div>
      )}
    </div>
  );
};

export default LazyImage;