'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { DocumentArrowUpIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { gpx } from '@tmcw/togeojson';

// Dynamically import map to avoid SSR issues
const MergeMapPreview = dynamic(() => import('./MergeMapPreview'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-[#faf8f5] text-[#7d8493]">Chargement de la carte...</div>
});

interface GpxSegment {
  id: string;
  file: File;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geoJson: any; // GeoJSON
  originalXml: Document;
  reversed: boolean;
  distance: number;
}

export default function MergeGpxForm(): React.ReactElement {
  const [segments, setSegments] = useState<GpxSegment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to calculate distance from GeoJSON LineString
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateDistance = (geoJson: any): number => {
    let dist = 0;
    const getDist = (c1: number[], c2: number[]): number => {
      const R = 6371e3;
      const lat1 = c1[1] * Math.PI / 180;
      const lat2 = c2[1] * Math.PI / 180;
      const dLat = (c2[1] - c1[1]) * Math.PI / 180;
      const dLon = (c2[0] - c1[0]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
      return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * R;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geoJson.features.forEach((feature: any) => {
      if (feature.geometry.type === 'LineString') {
        const coords = feature.geometry.coordinates;
        for (let i = 0; i < coords.length - 1; i++) {
          dist += getDist(coords[i], coords[i+1]);
        }
      }
    });
    return dist / 1000; // km
  };

  const processFiles = async (files: File[]): Promise<void> => {
    setError(null);

    try {
      const newSegments: GpxSegment[] = [];

      for (const file of files) {
        if (!file.name.toLowerCase().endsWith('.gpx')) {
           continue;
        }

        const text = await file.text();
        const parser = new window.DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const parsedGeoJson = gpx(xmlDoc);

        newSegments.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          geoJson: parsedGeoJson,
          originalXml: xmlDoc,
          reversed: false,
          distance: calculateDistance(parsedGeoJson)
        });
      }

      setSegments(prev => [...prev, ...newSegments]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(`Erreur de lecture: ${err.message}`);
    }
  };

  const onDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (): void => setIsDragging(false);
  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      void processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeSegment = (id: string): void => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const toggleReverse = (id: string): void => {
    setSegments(prev => prev.map(s => {
      if (s.id !== id) return s;

      // Reverse GeoJSON coordinates for preview
      const newGeoJson = JSON.parse(JSON.stringify(s.geoJson));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newGeoJson.features.forEach((f: any) => {
        if (f.geometry.type === 'LineString') {
          f.geometry.coordinates.reverse();
        }
      });

      return { ...s, reversed: !s.reversed, geoJson: newGeoJson };
    }));
  };

  const moveSegment = (index: number, direction: 'up' | 'down'): void => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === segments.length - 1) return;

    setSegments(prev => {
      const arr = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const totalDistance = segments.reduce((acc, s) => acc + s.distance, 0);

  const handleMergeAndDownload = (): void => {
    if (segments.length < 2) return;

    try {
      // 1. Create base GPX structure
      const serializer = new window.XMLSerializer();
      const outputDoc = document.implementation.createDocument("http://www.topografix.com/GPX/1/1", "gpx", null);
      const gpxNode = outputDoc.documentElement;

      gpxNode.setAttribute("creator", "SiderealSatellite");
      gpxNode.setAttribute("version", "1.1");
      gpxNode.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");

      const NS = "http://www.topografix.com/GPX/1/1";
      const trk = outputDoc.createElementNS(NS, "trk");
      const name = outputDoc.createElementNS(NS, "name");
      name.textContent = "Merge - " + new Date().toISOString().split('T')[0];
      trk.appendChild(name);

      const trkseg = outputDoc.createElementNS(NS, "trkseg");

      // 2. Extract and append points from each segment in order
      segments.forEach(seg => {
        // We need to query trkpt nodes from the original XML
        const trkpts = Array.from(seg.originalXml.getElementsByTagName("trkpt"));

        // Reverse if requested
        if (seg.reversed) {
          trkpts.reverse();
        }

        trkpts.forEach(pt => {
           // Create a new trkpt node in the output document to avoid "WrongDocumentError"
           const newPt = outputDoc.importNode(pt, true);
           trkseg.appendChild(newPt);
        });
      });

      trk.appendChild(trkseg);
      gpxNode.appendChild(trk);

      // 3. Serialize and trigger download
      const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(outputDoc);
      const blob = new Blob([xmlString], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_trace_${new Date().getTime()}.gpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError("Erreur lors de la fusion: " + e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form & List */}
      <div className="lg:col-span-5 space-y-6">

        {/* Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            border border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-[#e03e3e] bg-[#e03e3e]/5' : 'border-[#e4e0d8] bg-white hover:bg-[#faf8f5]'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".gpx"
            onChange={(e) => {
              if (e.target.files?.length) {
                void processFiles(Array.from(e.target.files));
              }
              // Reset input
              e.target.value = '';
            }}
          />
          <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-[#7d8493] mb-3" />
          <p className="text-sm font-semibold text-[#101216]">Glissez-déposez vos fichiers GPX ici</p>
          <p className="text-xs text-[#5c6370] mt-1">ou cliquez pour parcourir</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Segments List */}
        {segments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216]">Segments ({segments.length})</h3>

            <div className="space-y-2">
              {segments.map((seg, index) => (
                <div key={seg.id} className="flex items-center gap-3 p-3 bg-white border border-[#e4e0d8] rounded-md">

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSegment(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-[#7d8493] hover:text-[#101216] disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveSegment(index, 'down')}
                      disabled={index === segments.length - 1}
                      className="p-1 text-[#7d8493] hover:text-[#101216] disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#101216] truncate" title={seg.name}>{seg.name}</p>
                    <p className="text-xs text-[#5c6370] tabular-nums">{seg.distance.toFixed(1)} km</p>
                  </div>

                  <button
                    onClick={() => toggleReverse(seg.id)}
                    className={`p-2 rounded-md transition-colors ${seg.reversed ? 'bg-[#101216] text-white' : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8]'}`}
                    title="Inverser le sens"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => removeSegment(seg.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e4e0d8]">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold uppercase text-[#5c6370]">Distance Totale</span>
                 <span className="text-xl font-extrabold tabular-nums text-[#101216]">{totalDistance.toFixed(1)} km</span>
               </div>

               <button
                 onClick={handleMergeAndDownload}
                 disabled={segments.length < 2}
                 className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-xs text-xs font-bold uppercase tracking-wider text-white bg-[#e03e3e] hover:bg-[#c93434] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 Fusionner et Télécharger
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Map Preview */}
      <div className="lg:col-span-7 h-[400px] lg:h-[600px] bg-white border border-[#e4e0d8] rounded-lg overflow-hidden sticky top-8">
         <MergeMapPreview segments={segments} />
      </div>
    </div>
  );
}
