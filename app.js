const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const path = require('path');

const app = express();

const router = express.Router();

const directoryPath = '../files'; // Change this to your target directory

const getData = (req, res) => {
  const month = req.params.month;
  const board = req.params.board;
  const type = req.params.type;

  const suffix =
    board === 'cwmtaf' || board === 'cardiff' || board === 'powys'
      ? '_download'
      : '';
  fs.readFile(
    `../files/${type}_${board}${suffix}_${month}.csv`,
    (err, data) => {
      if (err) {
        res.status(404).end('File not found');
        return;
      }
      res.status(200).end(data);
    }
  );
};

const getFilesInfo = (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'Error reading directory', details: err.message });
    }

    const result = [];
    let processedFiles = 0;

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          processedFiles++;
          return console.error(`Error reading file stats for ${file}:`, err);
        }

        if (stats.isFile()) {
          fs.readFile(filePath, 'utf8', (err, data) => {
            processedFiles++;
            if (err) {
              return console.error(`Error reading file ${file}:`, err);
            }

            const numberOfRows = data.split('\n').length;
            result.push({
              file: file,
              sizeInRows: numberOfRows,
              created: stats.birthtime,
            });

            if (processedFiles === files.length) {
              res.json(result);
            }
          });
        } else {
          processedFiles++;
          if (processedFiles === files.length) {
            res.json(result);
          }
        }
      });
    });
  });
};
app.use(express.json());
app.use(morgan('dev'));

app.use('/', router);

const healthCheck = (req, res, next) => {
  res.status(200).json({ status: 'success' });
};

router.route('/healthcheck').get(healthCheck);
router.route('/getdata/:board/:month/:type').get(getData);
router.route('/files').get(getFilesInfo);

module.exports = app;
