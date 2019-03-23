const csvParse = require('csv-parse');
const fs = require('fs');

const parser = (filePath) => {
  const parsedFile = [];
  return new Promise((resolve, reject) => {
    const parser = csvParse({
      skip_empty_lines: true,
      columns: true
    });

    fs.createReadStream(filePath)
      .pipe(parser)
      .on('data', (row) => {
          parsedFile.push(row);
      })
      .on('end', () => {
        resolve(parsedFile);
      })
      .on('error', (err) => {
        reject(err);
      })
  });
};

module.exports = parser;
