export interface IAllFields {
    IANAVersion: string;
    originalFileName: string;
    numberOfZones: number;
    zones: IZones[];
}
export interface IZones {
    countryCodes: string[];
    timezone: string;
    coordinates: {
        latitude: ICoordinate;
        longitude: ICoordinate;
    };
    comments: string | null;
}
export interface ICoordinate {
    sign: string;
    degree: number;
    minute: number;
    second: number | null;
}
