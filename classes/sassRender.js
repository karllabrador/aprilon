const fs = require('fs');
const sass = require('sass');

/**
 * Simple wrapper for sass
 * @param file
 * @param outputFile
 */
const sassRender = (file, outputFile) => {
    const outputDir = outputFile.substring(0, outputFile.lastIndexOf('/'));
    fs.mkdir(outputDir, { recursive: true }, (e) => {
        if (e) return console.error(e);

        console.info('Created directory %s', outputDir);
    })

    sass.render({
        file: file,
        outputStyle: 'compressed'
    }, (error, result) => {
        if (!error) {
            fs.writeFile(outputFile, result.css, (e) => {
                if (e) return console.error(e);

                console.info('Wrote to %s', outputFile);
            })
        }
    })
}

module.exports = sassRender;