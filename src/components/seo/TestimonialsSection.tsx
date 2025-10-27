import React from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Testimonial {
  author: string;
  rating: number;
  comment: string;
  service: string;
  verified?: boolean;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  city: string;
}

export default function TestimonialsSection({ testimonials, city }: TestimonialsSectionProps) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Témoignages clients à {city}
        </h2>
        <p className="text-lg text-muted-foreground">
          Ce que nos clients disent de nos services
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <Card key={index} className="p-6 bg-white border-2 border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{testimonial.comment}"
              </p>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.service}</p>
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Vérifié</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
