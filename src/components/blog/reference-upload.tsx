'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ReferenceFile {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface ReferenceUploadProps {
  onFilesUploaded: (files: ReferenceFile[]) => void;
}

export function ReferenceUpload({ onFilesUploaded }: ReferenceUploadProps) {
  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const newFiles: ReferenceFile[] = await Promise.all(
        acceptedFiles.map(async (file) => {
          const content = await file.text();
          return {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            content,
          };
        })
      );

      setFiles((prev) => [...prev, ...newFiles]);
      onFilesUploaded([...files, ...newFiles]);
      
      toast({
        title: 'Success',
        description: 'Reference files uploaded successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    }
  }, [files, onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    onFilesUploaded(files.filter((file) => file.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop reference files here, or click to select files'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded References</h3>
          <div className="grid gap-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 