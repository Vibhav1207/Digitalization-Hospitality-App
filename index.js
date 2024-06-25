const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

app.post('/upload_groups', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    await axios.post('http://localhost:5000/upload_groups', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    res.send('Groups uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to upload groups');
  }
});

app.post('/upload_hostels', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    await axios.post('http://localhost:5000/upload_hostels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    res.send('Hostels uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to upload hostels');
  }
});

app.post('/allocate_rooms', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5000/allocate_rooms');
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="allocations.csv"');
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to allocate rooms');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
