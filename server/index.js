const fs = require('fs');
const cors = require('cors');
const path = require('path');
const child_process = require('child_process');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();

const dataDir = path.join(__dirname, 'data');
let PORT = 3001;

app.use(morgan('dev'));
app.use(compression());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  PORT = 8080;
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../build')));
  // Handle React routing, return all requests to React app
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.get('/water', auth, (req, res) => { // add auth as middleware if authentication wanted
  fs.readFile(path.join(dataDir, 'data.json'), 'utf-8', (err, data) => {
    try {
      const arrayRPITemp = JSON.parse(data);
      arrayRPITemp.data = arrayRPITemp.data.slice(-5000);
      arrayRPITemp.labels = arrayRPITemp.labels.slice(-5000);
      // let temperatureArray = arrayRPITemp.data.map(el => parseFloat(el));
      // let temperatureSum = temperatureArray.reduce((prev, curr) => {
      //   return prev + curr;
      // }, 0)
      // console.log(temperatureSum)
      // console.log(arrayRPITemp.data.length)
      // console.log("Average = " + temperatureSum/arrayRPITemp.data.length)
      res.send(arrayRPITemp);
    } catch (e) {
      res.send(e);
      console.log(e);
    }
  });
});

app.get('/weather', (req, res) => {
  fs.readFile('sacramento-weather.json', 'utf-8', (err, data) => {
    try {
      res.send(JSON.parse(data));
    } catch (e) {
      res.send(e);
      console.log(e);
    }
  });
});

app.get('/status/water', auth, (req, res) => {
  fs.readFile(path.join(dataDir, 'water-status.json'), 'utf-8', (err, data) => {
    try {
      res.send(JSON.parse(data));
    } catch (e) {
      res.send(e);
      console.log(e);
    }
  });
});

app.post('/login', (req, res) => {
  if (req.body.username !== undefined && req.body.password !== undefined && (req.body.username === process.env.user)) {
    bcrypt.compare(req.body.password, process.env.hash, (err, same) => {
      console.log(req.body.password);
      console.log(process.env.hash);
      console.log(same);
      if (err) {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
      if (same) {
        jwt.sign({
          username: req.body.username,
        }, process.env.JWT_KEY, { expiresIn: 60 * 60 }, (err, token) => {
          console.log(token);
          return res.status(200).json({
            message: 'Auth successful',
            token,
          });
        });
      } else {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
    });
  } else {
    return res.status(401).json({
      message: 'Auth failed',
    });
  }
});

app.get('/water/activity/logs', (req, res) => {
  fs.readFile(path.join(dataDir, 'water-activity-logs.log'), 'utf-8', (err, data) => {
    res.send(data);
  });
});

app.post('/water/activate/:zone/:time?', auth, (req, res) => {
  const { zone, time } = req.params;
  if (time === undefined) {
    res.status(400).send({
      message: 'You have to specify the amount of time.',
    });
    res.sendStatus(400);
  }
  console.log(zone, time);
  child_process.spawn('python', ['./workers/rpi-gpio.py', 'activate', zone, time]);
  res.sendStatus(200);
});

app.post('/water/deactivate/:zone', auth, (req, res) => {
  const { zone } = req.params;
  // For some reason spawn didn't work with a the threading of the python script
  // child_process.spawn('python', ['./workers/rpi-gpio.py', 'deactivate', zone]);
  child_process.exec(`python ./workers/rpi-gpio.py deactivate ${zone}`);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

fs.watchFile('data.json', (curr, prev) => {
  console.log(curr.mtime);
  console.log(prev.mtime);
});
