import { FC } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import BlogManagement from './BlogManagement';

export const BlogAdmin: FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-badge-light rounded-lg">
              <BookOpen className="h-6 w-6 text-info-badge" />
            </div>
            <div>
              <CardTitle>Administration du Blog</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez tous les aspects de votre blog - articles, catégories, templates et analytics
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <BlogManagement />
    </div>
  );
};

export default BlogAdmin;
