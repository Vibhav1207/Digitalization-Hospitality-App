const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const mongoose = require('mongoose');
const Group = require('./models/Group');
const Hostel = require('./models/Hostel');

const app = express();
const upload = multer({ dest: 'uploads/' });

const MONGODB_URI = 'your-mongodb-connection-string-here';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.fields([{ name: 'groupFile' }, { name: 'hostelFile' }]), async (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  const groupFilePath = req.files.groupFile[0].path;
  const hostelFilePath = req.files.hostelFile[0].path;

  try {
   
    const groupData = fs.readFileSync(groupFilePath, 'utf-8');
    const groupLines = groupData.trim().split('\n');
    const groupHeaders = groupLines[0].split(',');
    const groups = groupLines.slice(1).map(line => {
      const values = line.split(',');
      return {
        groupId: values[0],
        members: values[1],
        gender: values[2]
      };
    });

    await Group.deleteMany({});
    await Group.insertMany(groups);

    
    const hostelData = fs.readFileSync(hostelFilePath, 'utf-8');
    const hostelLines = hostelData.trim().split('\n');
    const hostelHeaders = hostelLines[0].split(',');
    const hostels = hostelLines.slice(1).map(line => {
      const values = line.split(',');
      return {
        hostelName: values[0],
        roomNumber: values[1],
        capacity: values[2],
        gender: values[3]
      };
    });

    await Hostel.deleteMany({});
    await Hostel.insertMany(hostels);

   
    const formData = new FormData();
    formData.append('groupFile', fs.createReadStream(groupFilePath));
    formData.append('hostelFile', fs.createReadStream(hostelFilePath));

    const response = await axios.post('http://localhost:5000/allocate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const allocation = response.data;
    const csvFilePath = path.join(__dirname, 'uploads', 'allocation.csv');

    const csvWriterInstance = csvWriter({
      path: csvFilePath,
      header: [
        { id: 'groupId', title: 'Group ID' },
        { id: 'hostelName', title: 'Hostel Name' },
        { id: 'roomNumber', title: 'Room Number' },
        { id: 'membersAllocated', title: 'Members Allocated' }
      ]
    });

    await csvWriterInstance.writeRecords(allocation);

    res.render('allocation', { allocation, downloadLink: `/download/allocation.csv` });
  } catch (error) {
    res.status(500).send('Error in allocation');
  }
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
