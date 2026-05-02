import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Linkedin, Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  layout?: 'horizontal' | 'sticky';
}

export function ShareButtons({ url, title, className = '', layout = 'horizontal' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: Share2,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copié');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const containerClass =
    layout === 'sticky'
      ? 'flex flex-col gap-2'
      : 'flex flex-wrap items-center gap-2';

  return (
    <div className={`${containerClass} ${className}`} aria-label="Partager l'article">
      {targets.map(({ name, icon: Icon, href }) => (
        <Button
          key={name}
          asChild
          size="icon"
          variant="outline"
          aria-label={`Partager sur ${name}`}
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
      <Button
        size="icon"
        variant="outline"
        onClick={handleCopy}
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default ShareButtons;
