declare module '@mapbox/polyline' {
    export function decode(string: string, precision?: number): number[][];
    export function encode(coordinates: [number, number][], precision?: number): string;
    export function fromGeoJSON(geojson: any, precision?: number): string;
}

declare module '@tmcw/togeojson' {
    export function kml(doc: Document): any;
    export function gpx(doc: Document): any;
}

declare module 'firebase/storage' {
    export interface FirebaseStorage {
        [key: string]: any;
    }
    export function getStorage(app?: any, bucketUrl?: string): FirebaseStorage;
    export function ref(storage: any, url?: string): any;
    export function uploadBytes(ref: any, data: any, metadata?: any): Promise<any>;
    export function getDownloadURL(ref: any): Promise<string>;
    export function deleteObject(ref: any): Promise<void>;
}


