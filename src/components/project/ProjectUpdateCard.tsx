// components/projects/project-card.tsx
import { IProject } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/helpers/formatDate';

interface ProjectCardProps {
  project: IProject;
  onEdit: (project: IProject) => void;
  onDelete: (projectId: number) => void;
}

export const ProjectUpdateCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {


  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        {/* Project Image */}
        <div className="relative h-48 w-full">
          <Image
            src={project.image[0]}
            alt={project.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => onEdit(project)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 bg-destructive/80 backdrop-blur-sm hover:bg-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Project Details */}
        <div className="p-4 space-y-3">
          {/* Title and Location */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          {/* Financial Info */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="font-medium text-foreground">{project.totalShare}</div>
              <div className="text-muted-foreground">মোট শেয়ার</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="font-medium text-foreground">৳{project.sharePrice}</div>
              <div className="text-muted-foreground">শেয়ার মূল্য</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="font-medium text-foreground">৳{project.profitPerShare}</div>
              <div className="text-muted-foreground">লাভ/শেয়ার</div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>মেয়াদ: {formatDate(project.expireDate)}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {formatDate(project.Duration)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};