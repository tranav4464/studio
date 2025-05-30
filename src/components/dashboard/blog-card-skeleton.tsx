
"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <Card className="flex flex-col h-full shadow-lg rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" /> {/* Placeholder for hero image */}
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" /> {/* Placeholder for title */}
        <Skeleton className="h-4 w-1/2" /> {/* Placeholder for description/date */}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-4 w-full mb-1" /> {/* Placeholder for topic/content line 1 */}
        <Skeleton className="h-4 w-5/6" />      {/* Placeholder for topic/content line 2 */}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <Skeleton className="h-6 w-20" /> {/* Placeholder for badge */}
        <Skeleton className="h-8 w-24" /> {/* Placeholder for edit button */}
      </CardFooter>
    </Card>
  );
}
