/**
 * Service d'optimisation d'images
 * Conversion WebP/AVIF et lazy loading
 */

export class ImageOptimizer {
  private observer: IntersectionObserver | null = null;

  async initialize(): Promise<void> {
    this.setupLazyLoading();
    this.optimizeExistingImages();
  }

  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observer toutes les images avec data-src
      document.querySelectorAll('img[data-src]').forEach((img) => {
        this.observer?.observe(img);
      });
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src) {
      // Créer une version optimisée si possible
      const optimizedSrc = this.getOptimizedImageUrl(src);
      img.src = optimizedSrc;
      img.classList.add('loaded');
    }
  }

  private getOptimizedImageUrl(originalUrl: string): string {
    // Vérifier le support WebP/AVIF
    const supportsWebP = this.supportsFormat('webp');
    const supportsAVIF = this.supportsFormat('avif');

    if (supportsAVIF) {
      return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.avif');
    } else if (supportsWebP) {
      return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return originalUrl;
  }

  private supportsFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
    } catch {
      return false;
    }
  }

  private optimizeExistingImages(): void {
    // Ajouter loading="lazy" aux images existantes
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      const rect = htmlImg.getBoundingClientRect();
      
      // Ne pas lazy load les images above-the-fold
      if (rect.top > window.innerHeight) {
        htmlImg.loading = 'lazy';
      } else {
        htmlImg.loading = 'eager';
        htmlImg.fetchPriority = 'high';
      }
    });
  }

  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Redimensionner si trop grande
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en WebP si supporté
        const quality = file.size > 1024 * 1024 ? 0.8 : 0.9; // Plus de compression pour gros fichiers
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'), {
              type: 'image/webp'
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/webp', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}