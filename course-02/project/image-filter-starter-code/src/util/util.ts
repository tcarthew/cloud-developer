import fs from 'fs';
import Jimp = require('jimp');

function isError(err: unknown): err is Error {
    return typeof err === 'object' && err.hasOwnProperty('message');
}

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export const filterImageFromURL = async (inputURL: string): Promise<string> => {
    const photo = await Jimp.read(inputURL);
    const outpath = `/tmp/filtered.${Math.floor(Math.random() * 2000)}.jpg`;
    const filterImageOutput = `${__dirname}${outpath}`;

    try {
        photo
            .resize(256, 256)   // resize
            .quality(60)        // set JPEG quality
            .greyscale()        // set greyscale

        await photo.writeAsync(filterImageOutput);

        return filterImageOutput;
    } catch (err) {
        const message = isError(err) ? err.message : 'Unknown';
        console.log(`Error filtering image ${inputURL} : ${message}`);
        throw err;
    }
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export const deleteLocalFiles = (files: Array<string>) => {
    files.forEach(f => fs.unlinkSync(f));
}