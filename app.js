const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const app = express();
let responseObj = {
    AppName: config.name,
    Dir: config.imageDir,
    Extension: config.extension,
    Count: {}
};

function countImageFiles(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        return files.length;
    } catch (err) {
        throw new Error(`ERROR: Error reading directory ${dirPath}: ${err.message}`);
    }
}

function validateFileNaming(dir) {
    const files = fs.readdirSync(dir)
        .filter(file => path.extname(file).toLowerCase() === `.${config.extension}`)
        .map(file => path.basename(file, `.${config.extension}`))
        .sort((a, b) => Number(a) - Number(b));

    for (let i = 0; i < files.length; i++) {
        if (Number(files[i]) !== i + 1) {
            throw new Error(`ERROR: The naming of ${dir}/${files[i]}.${config.extension} is inconsistent with the rest. File numbers must follow a sequential order and start from 1.`);
        }
    }

    const incorrectFileExtensions = fs.readdirSync(dir)
        .filter(file => path.extname(file).toLowerCase() !== `.${config.extension}`);

    if (incorrectFileExtensions.length > 0) {
        throw new Error(`ERROR: Files with incorrect extensions detected. All files must have an extension specified in config.json, in this case, ".${config.extension}". Invalid files: ${incorrectFileExtensions.join()}`);
    }
}

function calculateFileCounts() {
    const dirs = ['Backlog', 'Days', 'Months', 'None', 'Other', 'Empty'];

    dirs.forEach(dir => {
        const fullDirPath = `./${config.imageDir}/${dir}`;
        validateFileNaming(fullDirPath);
        responseObj.Count[dir] = countImageFiles(fullDirPath);
    });
}

calculateFileCounts();

app.use('/images', express.static(path.join(__dirname, config.imageDir)));

app.get('/', (req, res) => {
    res.json(responseObj);
});

app.use((req, res) => {
    res.status(404).json({
        InnerCode: 1,
        ErrorMessage: "Page not found"
    });
});

app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});