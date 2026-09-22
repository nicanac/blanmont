declare module '@mapbox/polyline' {
    export function decode(string: string, precision?: number): number[][];
    export function encode(coordinates: [number, number][], precision?: number): string;
    export function fromGeoJSON(geojson: Record<string, unknown> | unknown, precision?: number): string;
}

declare module '@tmcw/togeojson' {
    export interface GeoJsonFeature {
        type: string;
        geometry: {
            type: string;
            coordinates: number[] | number[][] | number[][][];
        };
        properties?: Record<string, unknown>;
    }

    export interface GeoJsonFeatureCollection {
        type: 'FeatureCollection';
        features: GeoJsonFeature[];
        [key: string]: unknown;
    }

    export function kml(doc: Document): GeoJsonFeatureCollection;
    export function gpx(doc: Document): GeoJsonFeatureCollection;
}

