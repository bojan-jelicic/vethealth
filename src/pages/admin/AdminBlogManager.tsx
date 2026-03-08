import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const placeholderPosts = [
  { id: '1', title: 'Kako zaštititi ljubimca od krpelja', date: '2026-03-05', status: 'Objavljeno', category: 'Savjeti' },
  { id: '2', title: 'Ishrana starijih pasa', date: '2026-03-01', status: 'Nacrt', category: 'Ishrana' },
  { id: '3', title: 'Važnost redovnih pregleda', date: '2026-02-28', status: 'Objavljeno', category: 'Zdravlje' },
];

const AdminBlog = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Blog</h1>
        <p className="text-sm text-muted-foreground">Upravljanje blog postovima</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-2" />Novi članak</Button>
    </div>

    <div className="grid gap-4">
      {placeholderPosts.map((post) => (
        <div key={post.id} className="bg-card rounded-lg border border-border p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
          <div className="space-y-1">
            <h3 className="font-heading font-semibold text-foreground">{post.title}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.category}</span>
            </div>
          </div>
          <Badge variant={post.status === 'Objavljeno' ? 'secondary' : 'outline'}>{post.status}</Badge>
        </div>
      ))}
    </div>
  </div>
);

export default AdminBlog;
