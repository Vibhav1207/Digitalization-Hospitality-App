const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Group = require('./models/Group');
const Hostel = require('./models/Hostel');

const app = express();
const port = 3000;

app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set the views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Multer storage configuration to keep original file names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
const mongoURI = 'your-mongodb-mongodb+srv://iittechfestvibhavpatel:G8nkHiFPpqBJljpM@cluster0.50yakxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB connection string

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});

let groupFilePath = '';
let hostelFilePath = '';

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/uploadGroups', upload.single('groupFile'), (req, res) => {
  groupFilePath = path.join(__dirname, 'uploads', req.file.originalname);
  console.log(`Group file path set to: ${groupFilePath}`);
  res.send('Group information uploaded successfully.');
});

app.post('/uploadHostels', upload.single('hostelFile'), (req, res) => {
  hostelFilePath = path.join(__dirname, 'uploads', req.file.originalname);
  console.log(`Hostel file path set to: ${hostelFilePath}`);
  res.send('Hostel information uploaded successfully.');
});

app.get('/allocateRooms', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/allocate_rooms', {
      groupFilePath: groupFilePath,
      hostelFilePath: hostelFilePath
    });

    const allocationData = response.data;
    const downloadLink = `http://127.0.0.1:5000/download_allocation`;

    res.render('allocation', { allocation: allocationData, downloadLink: downloadLink });
  } catch (error) {
    console.error('Error in allocation:', error.response ? error.response.data : error.message);
    res.status(500).send(`Error in allocation: ${error.response ? error.response.data : error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
