// main.mjs

import fs from 'fs';
import path from 'path';


function extractImagesFromFolders (directoryPath) {
    const folders = fs.readdirSync(directoryPath, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const result = {};

    folders.forEach(folder => {
        const folderPath = path.join(directoryPath, folder);
        const images = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.jpg') || file.endsWith('.png')); // 添加其他图片格式

        result[folder] = images;
    });

    return result;
}

const srcDirectory = process.argv[2];
const extractedData = extractImagesFromFolders(srcDirectory);

const outputPath = path.join(process.argv[3]);
fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
