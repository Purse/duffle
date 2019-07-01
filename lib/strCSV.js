const csvStr = require('csv-stringify');
const fs = require('fs');

const parser = (filePath, jsonAry) => {
  const parsedFile = '';
  return new Promise((resolve, reject) => {
    const stringifier = csvStr({
      delimiter: ',',
      header: true
    });
    
    stringifier.on('error', (err) => {
      reject(err);
    });
    
    stringifier.on('finish', () => {
      resolve();
    });
    
    jsonAry.forEach((row) => {
      stringifier.write(row);
    });
    
    stringifier.end();
  });
};

module.exports = parser;
