const app = require('./app');
const port = 3000;
app.listen(port, () => {
  console.log(`Swab Info Server running on port ${port}`);
});
