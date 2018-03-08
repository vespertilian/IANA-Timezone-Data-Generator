import {getIANATzData} from '../get-iana-tz-data/get-iana-tz-data';
import {extractTzData, IExtractedTimezoneData} from '../extract-tz-data';
import * as path from 'path';
import * as Handlebars from 'handlebars'
import {readdirAsync, readFileAsync, writeFileAsync} from '../util/util';

export interface ICreateJSONSettings {
    templatesPath: string,
    saveDirectory: string,
    zoneFileNames: string[]
}

const defaultSettings: ICreateJSONSettings = {
    templatesPath: path.join(__dirname, '..', '..', 'templates'),
    saveDirectory: path.join(__dirname, '..', '..', 'timezones'),
    zoneFileNames: ['zone.tab', 'zone1970.tab']
};

export async function createJSONFromHandlebarsTemplatesAndZoneData(_settings: ICreateJSONSettings = {} as any) {
    const settings: ICreateJSONSettings = {...defaultSettings, ..._settings};

    const zoneData = await getIANATzData();
    const files = await readdirAsync(settings.templatesPath);

    settings.zoneFileNames.forEach((name) => {
        const extractedZoneData = extractTzData(zoneData, name);
        createJSONFromHandlebarsTemplates(
            files,
            extractedZoneData,
            settings.templatesPath,
            name,
            settings.saveDirectory
        );
    })
}

function createJSONFromHandlebarsTemplates(files: string[], extractedZoneData: IExtractedTimezoneData, templatesPath: string, zoneFileName: string, saveDirectory: string) {
    files
        .filter(isHandleBarsFile)
        .forEach(async (filename: string) => {

            console.log(`Creating JSON for: ${filename} with ${zoneFileName}`);

            const filePath = `${templatesPath}/${filename}`;
            const hbsFile = await readFileAsync(filePath, 'utf-8');

            const hbsTemplate = Handlebars.compile(hbsFile);

            const output = hbsTemplate(extractedZoneData);

            try {
                // parseJSON to make sure it is valid!
                const parsedJSON = JSON.parse(output);

                // create filename and path
                const filenameSansTab = zoneFileName.replace('.tab', '');
                const writeFileName = `${extractedZoneData.version}-${filenameSansTab}-${filename.replace('.hbs', '.json')}`;
                const writePath = path.join(saveDirectory, writeFileName);

                // turn json into pretty string and write file,
                // this formats it slightly better than handlebars
                const jsonString = JSON.stringify(parsedJSON, null, 4);
                await writeFileAsync(writePath, jsonString);

            } catch(e) {
                const errorPath = path.join(__dirname, '..', 'timezones', 'error.txt');

                try {
                    await writeFileAsync(errorPath, output);
                } catch(e) {
                    throw new Error(`
                Could not write error file: ${e}
               `)
                }

                throw new Error(`
                Could not parse JSON please check your templates.
                See timezones/error.txt 
                Error: ${e}
            `)
            }
        })
}

function isHandleBarsFile(filename: string) {
    return filename.includes('.hbs')
}

createJSONFromHandlebarsTemplatesAndZoneData()
    .then(() => { console.log('created json')})
    .catch(e => console.log(e));


