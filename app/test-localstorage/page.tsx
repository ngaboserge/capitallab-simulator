'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestLocalStoragePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Get all localStorage keys
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    setAllKeys(keys);

    // Get all section data
    const sectionData: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('mock_section')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          sectionData.push({
            key,
            status: data.status,
            completion: data.completion_percentage,
            dataKeys: Object.keys(data.data || {}),
            updated: data.updated_at
          });
        } catch (e) {
          sectionData.push({
            key,
            error: 'Failed to parse'
          });
        }
      }
    }
    setSections(sectionData);
  };

  const clearAll = () => {
    if (confirm('Clear all localStorage? This cannot be undone!')) {
      localStorage.clear();
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={loadData}>Refresh</Button>
              <Button onClick={clearAll} variant="destructive">Clear All</Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Total Keys: {allKeys.length}</h3>
              <div className="text-sm text-gray-600">
                {allKeys.filter(k => k.includes('mock_section')).length} section keys found
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Data ({sections.length} sections)</CardTitle>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No section data found in localStorage
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="font-mono text-xs text-gray-600 mb-2">
                      {section.key}
                    </div>
                    {section.error ? (
                      <div className="text-red-600">{section.error}</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold">Status:</span> {section.status}
                        </div>
                        <div>
                          <span className="font-semibold">Completion:</span> {section.completion}%
                        </div>
                        <div>
                          <span className="font-semibold">Data Fields:</span> {section.dataKeys.length}
                        </div>
                        <div>
                          <span className="font-semibold">Updated:</span>{' '}
                          {section.updated ? new Date(section.updated).toLocaleString() : 'Never'}
                        </div>
                        {section.dataKeys.length > 0 && (
                          <div className="col-span-2">
                            <span className="font-semibold">Fields:</span>{' '}
                            {section.dataKeys.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All LocalStorage Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-xs">
              {allKeys.map((key, index) => (
                <div key={index} className={key.includes('mock_section') ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
                  {key}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
