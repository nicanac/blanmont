declare module '@mapbox/polyline' {
    export function decode(string: string, precision?: number): number[][];
    export function encode(coordinates: [number, number][], precision?: number): string;
    export function fromGeoJSON(geojson: any, precision?: number): string;
}

declare module '@tmcw/togeojson' {
    export function kml(doc: Document): any;
    export function gpx(doc: Document): any;
}
