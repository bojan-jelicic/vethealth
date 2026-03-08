import { Image, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const placeholderImages = [
  { id: '1', src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', caption: 'Rex na pregledu' },
  { id: '2', src: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&h=300&fit=crop', caption: 'Mačka Mia' },
  { id: '3', src: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=300&h=300&fit=crop', caption: 'Naša ordinacija' },
  { id: '4', src: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=300&h=300&fit=crop', caption: 'Oprema' },
  { id: '5', src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop', caption: 'Tim' },
  { id: '6', src: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop', caption: 'Dr. Ana' },
];

const AdminGallery = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Galerija</h1>
        <p className="text-sm text-muted-foreground">Upravljanje slikama i medijima</p>
      </div>
      <Button><Upload className="w-4 h-4 mr-2" />Upload slika</Button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {placeholderImages.map((img) => (
        <div key={img.id} className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square overflow-hidden">
            <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="p-3">
            <p className="text-sm text-foreground truncate">{img.caption}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminGallery;
