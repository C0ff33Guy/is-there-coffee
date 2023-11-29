const express = require('express');
const CyclicDB = require('cyclic-dynamodb');

const app = express();

const db = CyclicDB(process.env.CYCLIC_DB);
const DB = db.collection('status')

const status = {
  state: null,
  updatedAt: new Date,
}

function isOld(d) {
  const date = new Date(d);
  const now = new Date();

  const isoDate = date.toISOString();
  const isoNow = now.toISOString();

  return (isoDate.slice(0, 10) != isoNow.slice(0, 10))
}

async function setState(val) {
  const now = new Date();

  return DB.set('status', {
    state: val,
    updatedAt: now.toISOString(),
  })
}

async function state() {
  const status = DB.get('status');

  if (!status || !status.updatedAt || isOld(status.updatedAt)) {
    await setState(null);
  }

  return status;
}

app.get('/status', async (req, res) => {
  return res.json(await state());
})

app.post('/status/true', async (req, res) => {
  await setState(true);
  res.end();
})

app.post('/status/false', async (req, res) => {
  await setState(false);
  res.end();
})

app.use(express.static('public'));

app.listen(process.env.PORT || 80);