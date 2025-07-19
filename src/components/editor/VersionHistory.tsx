"use client";

import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Clock, CheckCircle, RotateCcw } from "lucide-react";

type Version = {
  id: string;
  content: string;
  createdAt: Date;
  isCurrent?: boolean;
};

type VersionHistoryProps = {
  versions: Version[];
  onRestore: (version: Version) => Promise<void>;
  children: React.ReactNode;
};

export function VersionHistory({ versions, onRestore, children }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  
  const handleRestore = useCallback(async (version: Version) => {
    try {
      setIsLoading(true);
      setSelectedVersion(version);
      await onRestore(version);
      toast({
        title: "Version restored",
        description: "The selected version has been restored.",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to restore version:", error);
      toast({
        title: "Failed to restore version",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedVersion(null);
    }
  }, [onRestore]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4 -mr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow 
                    key={version.id}
                    className={version.isCurrent ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {version.isCurrent && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        {format(version.createdAt, "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>{format(version.createdAt, "h:mm a")}</TableCell>
                    <TableCell>
                      {version.isCurrent ? "Current Version" : "Previous Version"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!version.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version)}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isLoading && selectedVersion?.id === version.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {versions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 text-gray-400" />
                        <p>No version history available</p>
                        <p className="text-sm">Versions will appear here as you make changes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
