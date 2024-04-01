const cr2Raw = require('cr2-raw');
const fs = require('fs');
const path = require('path');

const convert = (source, destination) => new Promise((resolve, reject) => {
    try {
        const raw = cr2Raw(source);
        if (!raw) {
            throw new Error("CR2 conversion failed: No data returned");
        }
        const jpgDestination = destination.replace(/\.(cr2|CR2)$/, '.jpg'); // Replace .cr2 or .CR2 with .jpg
        fs.writeFileSync(jpgDestination, raw.previewImage());
        resolve(destination);
    } catch (error) {
        console.error(error);
        reject(error);
    }
});

const processDirectory = (sourceDir, destinationDir) => {
    fs.readdir(sourceDir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading directory:', sourceDir, err);
            return;
        }

        files.forEach((file) => {
            const sourcePath = path.join(sourceDir, file.name);
            const destinationPath = path.join(destinationDir, file.name);
            
            if (file.isDirectory()) {
                const newDestinationDir = path.join(destinationDir, file.name);
                fs.mkdirSync(newDestinationDir, { recursive: true });
                processDirectory(sourcePath, newDestinationDir);
            } else if (file.name.toLowerCase().endsWith('.cr2')) {
                convert(sourcePath, destinationPath)
                    .then(() => console.log('Converted:', sourcePath, '->', destinationPath))
                    .catch((error) => console.error('Error converting:', sourcePath, error));
            }
        });
    });
};

if (process.argv.length < 4) {
    console.error("Usage: node your_script.js source_folder destination_folder");
    process.exit(1); // Exit with error status
}

const sourceFolder = process.argv[2];
const destinationFolder = process.argv[3];

processDirectory(sourceFolder, destinationFolder);
