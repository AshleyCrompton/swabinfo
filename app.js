const express = require('express');
const morgan = require('morgan');

const fs = require('fs');

const app = express();

const router = express.Router();

const getData = (req, res) => {
  const month = req.params.month;
  const board = req.params.board;
  const type = req.params.type;

  const suffix =
    board === 'cwmtaf' || board === 'cardiff' || board === 'powys'
      ? '_download'
      : '';
  console.log(month, board);
  fs.readFile(
    `../files/${type}_${board}${suffix}_${month}.csv`,
    (err, data) => {
      if (err) {
        console.log(`Could not find file`);
        res.status(404).end('File not found');
        return;
      }
      res.status(200).end(data);
    }
  );
};

app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.use('/', router);

const sayHello = (req, res, next) => {
  res.status(200).json({ status: 'success', data: 'hello' });
};

router.route('/hello').get(sayHello);
router.route('/getdata/:board/:month/:type').get(getData);

module.exports = app;
