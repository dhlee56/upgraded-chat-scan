'use client';

interface ImageDisplayProps {
  src: string;
  alt: string;
  filename: string;
}

export default function ImageDisplay({ src, alt, filename }: ImageDisplayProps) {
  return (
    <div className="relative aspect-square">
      <img
        src={src}
        alt={alt}
        className="rounded-lg w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          console.error('Failed to load image:', target.src);
        }}
      />
    </div>
  );
} 