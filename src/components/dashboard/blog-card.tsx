
"use client";

import type { BlogPost } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import NextImage from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  onDelete?: (id: string) => void;
}

export function BlogCard({ post, onDelete }: BlogCardProps) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset imageError when the post prop changes
    setImageError(false);
  }, [post.heroImageUrl]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
      toast({
        title: "Blog post deleted",
        description: `"${post.title}" has been successfully deleted.`,
      });
    } else {
      toast({
        title: "Delete function not available",
        description: "Cannot delete this post.",
        variant: "destructive"
      });
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    toast({ 
      title: !newFavoriteState ? "Removed from Favorites" : "Added to Favorites!", 
      description: `"${post.title}" has been ${newFavoriteState ? 'added to' : 'removed from'} favorites.` 
    });
  };

  const getBadgeVariant = () => {
    switch (post.status) {
      case 'published':
        return 'published';
      case 'draft':
        return 'draft';
      case 'archived':
        return 'secondary'; 
      default:
        return 'secondary';
    }
  };

  const renderFavoriteButton = () => (
     <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 bg-background/70 hover:bg-background/90 group transform transition-transform duration-150 hover:scale-110 active:scale-95"
        onClick={handleFavorite}
        aria-label={isFavorited ? "Unfavorite post" : "Favorite post"}
      >
        <Icons.Favorite 
          className={cn(
            "h-4 w-4 transition-all duration-150",
            isFavorited 
              ? "text-yellow-500 fill-yellow-400" 
              : "text-muted-foreground group-hover:text-yellow-500 fill-none"
          )}
          strokeWidth={isFavorited ? 1.5 : 2}
        />
      </Button>
  );

  const renderImagePlaceholder = () => (
    <div className="relative h-48 w-full bg-muted flex items-center justify-center">
      <Icons.Logo className="h-16 w-16 text-muted-foreground/30" />
      {renderFavoriteButton()}
    </div>
  );


  return (
    <Card className={cn(
      "flex flex-col h-full rounded-lg overflow-hidden transition-all duration-200 ease-in-out",
      "shadow-sm dark:shadow-none", // Conditional base shadow
      "hover:scale-[1.01] hover:shadow-xl" // Hover effects
    )}>
      {(post.heroImageUrl && !imageError) ? (
        <div className="relative h-48 w-full">
          <NextImage
            src={post.heroImageUrl}
            alt={post.heroImageAltText || post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="article abstract"
            onError={() => setImageError(true)}
          />
           {renderFavoriteButton()}
        </div>
      ) : (
        renderImagePlaceholder()
      )}
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight mb-1 line-clamp-2">{post.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <Icons.MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/blogs/${post.id}/edit`} className="flex items-center w-full cursor-pointer">
                  <Icons.Grid /* Placeholder for View icon */ className="mr-2 h-4 w-4" /> View/Edit Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({title: "Export Blog", description: "Please go to the Edit page to find all export options."})} className="cursor-pointer">
                <Icons.Export className="mr-2 h-4 w-4" /> Export
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10 w-full cursor-pointer">
                        <Icons.Delete className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post "{post.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Updated: {format(parseISO(post.updatedAt), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          Topic: {post.topic}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <Badge variant={getBadgeVariant()} className="capitalize text-xs">
          {post.status}
        </Badge>
        <Link href={`/blogs/${post.id}/edit`} passHref>
          <Button variant="outline" size="sm">
            <Icons.Edit className="mr-1.5 h-3 w-3" /> Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

