const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username?.trim();
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const _id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const newUser = { username, _id, log: [] };
  users.push(newUser);
  res.json({ username, _id });
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, _id: u._id })));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  
  const user = users.find(u => u._id === _id);
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (!description || !duration)
    return res.status(400).json({ error: 'Description and duration are required' });

  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    description,
    duration: Number(duration),
    date: exerciseDate.toDateString()
  };

  user.log.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(400).json({ error: 'User not found' });

  let logs = user.log || [];

  if (from) logs = logs.filter(e => new Date(e.date) >= new Date(from));
  if (to) logs = logs.filter(e => new Date(e.date) <= new Date(to));
  if (limit) logs = logs.slice(0, parseInt(limit));

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
