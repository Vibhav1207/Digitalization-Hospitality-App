const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-prader');
const csv = require('csv-praser');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const Group = require('./models/Group');
const Hostel = require('./models/Hostel');

const app = express();
const port = 3000;

app.set('trust proxy',1);

//Middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

//Setting the views folder and view engine
app.set('views', path.json(__dirname, 'views'));
app.set('view engine', 'ejs');

//Storing the files uploaded by user in Uploads folder
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage});

//Connecting MongoDB
const mongoURI = 'mongodb+srv://iittechfestvibhavpatel:G8nkHiFPpqBJljpM@cluster0.50yakxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongooose.connect(mongoURI);

let groupFilePath = '';
let hostelFilePath = '';

//Routes
app.get('/', (req, res) =>{
    res.render('index');
});

//Uploading group file to uploads folder
app.post('/uploadGroups', upload.single('groupFile'), (req, res) =>{
    groupFilePath = path.join(__dirname, 'uploads', req.file.originalname);
    res.send('Group information uploaded successfully');
});

//Uploading hostel file to uploads folder
app.post('/uploadHostels', upload.single('Hostelfile'), (req, res) =>{
    groupFilePath = path.join(__dirname, 'uploads', req.file.originalname);
    res.send('Hostel information uploaded successfully');
});

app.get('/allocateRooms', async (req, res) => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/allocate', {
        params: {
          groupFilePath: groupFilePath,
          hostelFilePath: hostelFilePath,
        },
      });
      const allocationData = response.data.allocationResults;
      const downloadLink = `http://127.0.0.1:5000/download?filePath=${response.data.filePath}`;
  
      res.render('allocation', { allocation: allocationData, downloadLink: downloadLink });
    } catch (error) {
      console.error('Error in allocation:', error.response ? error.response.data : error.message);
      res.status(500).send(`Error in allocation: ${error.response ? error.response.data : error.message}`);
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });