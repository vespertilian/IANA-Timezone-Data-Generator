import {readFileAsync} from '../util/util';
import * as path from 'path';
import {extractTzData, IExtractedTimezone} from './extract-tz-data';
import {IANATzDataFiles} from '../get-iana-tz-data/get-iana-tz-data';

describe('extractTzData', () => {
    it('should extract data from the IANA .tab files', async() => {
        const zoneFileName = 'zone1970-test-file.tab';
        const filePath = path.join(__dirname, zoneFileName);
        const testFile = await readFileAsync(filePath);

        const zoneData: IANATzDataFiles = {
            version: '2018c',
            [zoneFileName]: testFile.toString()
        };

        const result = extractTzData(zoneData, zoneFileName);

        expect(result.version).toEqual('2018c');
        expect(result.numberOfZones).toEqual(266);

        const extractedTimezone: IExtractedTimezone = {
            countryCode: 'BR',
            coordinates: {
                latitude: { sign: '+', degree: 2, minute: 49, negative: false, second: null, decimal: 2.816667 },
                longitude: { sign: '-', degree: 60, minute: 40, negative: true, second: null, decimal: -60.666667}
            },
            timezoneName: 'Cameron/Test',
            comments: 'Foo'
        };

        expect(result.zones[1]).toEqual(extractedTimezone)
    });

    it('should extract data from the IANA .tab files with seconds', async() => {
        const zoneFileName = 'zone1970-test-file.tab';
        const filePath = path.join(__dirname, zoneFileName);
        const testFile = await readFileAsync(filePath);

        const zoneData: IANATzDataFiles = {
            version: '2018c',
            [zoneFileName]: testFile.toString()
        };

        const result = extractTzData(zoneData, zoneFileName);

        expect(result.version).toEqual('2018c');
        expect(result.numberOfZones).toEqual(266);

        const extractedTimezone: IExtractedTimezone = {
            countryCode: 'JM',
            coordinates: {
                latitude: { sign: '+', degree: 17, minute: 58, second: 5, negative: false, decimal: 17.968056 },
                longitude: { sign: '-', degree: 76, minute: 47, second: 36, negative: true, decimal: -76.793333 } },
            timezoneName: 'Cameron/TestA',
            comments: null
        };

        expect(result.zones[2]).toEqual(extractedTimezone)
    })

});