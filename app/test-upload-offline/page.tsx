'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OfflineUploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create file info
      const info = {
        name: selectedFile.name,
        size: selectedFile.size,
        sizeKB: (selectedFile.size / 1024).toFixed(2),
        sizeMB: (selectedFile.size / (1024 * 1024)).toFixed(2),
        type: selectedFile.type,
        lastModified: new Date(selectedFile.lastModified).toLocaleString(),
      };
      setFileInfo(info);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileInfo(null);
    setPreview(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Offline File Upload Test</CardTitle>
          <CardDescription>
            Test file selection and validation without any backend (100% client-side)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileChange}
            />
          </div>

          {fileInfo && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">File Selected Successfully!</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {fileInfo.name}</p>
                    <p><strong>Size:</strong> {fileInfo.sizeKB} KB ({fileInfo.sizeMB} MB)</p>
                    <p><strong>Type:</strong> {fileInfo.type}</p>
                    <p><strong>Last Modified:</strong> {fileInfo.lastModified}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {preview && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Image Preview:</p>
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full h-auto max-h-64 rounded"
              />
            </div>
          )}

          {file && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full"
            >
              Clear Selection
            </Button>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Test Status:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${file ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>File Selection: {file ? '✓ Working' : 'No file selected'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${fileInfo ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>File Reading: {fileInfo ? '✓ Working' : 'Waiting for file'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${preview ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Image Preview: {preview ? '✓ Working' : 'N/A (not an image)'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2 text-orange-600">⚠️ Supabase Connection Issue</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Your Supabase project appears to be offline or paused.</p>
              <p className="font-mono text-xs bg-muted p-2 rounded mt-2">
                evzvlwggcjojwqyqfbkk.supabase.co - Connection Failed
              </p>
              <p className="mt-2"><strong>To fix:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to supabase.com and log in</li>
                <li>Check if your project is paused (free tier pauses after 7 days)</li>
                <li>Click "Restore" or "Resume" if paused</li>
                <li>Wait 2-3 minutes for it to come online</li>
                <li>Then try the upload test again</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
