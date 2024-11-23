const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const app = express();
let responseObj = {
    Name: config.name,
    Dir: config.imageDir,
    Extension: config.extension,
    Count: {}
};

function countImageFiles(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        return files.filter(file => path.extname(file).toLowerCase() === `.${config.extension}`).length;
    } catch (err) {
        console.log(`Error reading directory ${dirPath}:`, err);
    }
}

function calculateFileCounts() {
    const dirs = ['backlog', 'days', 'months', 'none', 'other'];

    dirs.forEach(dir => {
        responseObj.Count[dir] = countImageFiles(`./${config.imageDir}/${dir}`);
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