'use strict';

const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');

const CLOUD_BUCKET = process.env.GCLOUD_STORAGE_BUCKET || 'test_aslam';
const PROJECT_ID = process.env.GCLOUD_STORAGE_BUCKET || 'test-nodejs-229006';
const KEY_FILE = process.env.GCLOUD_KEY_FILE || 'test-nodejs-8974b7716f56.json';
const PORT = process.env.PORT || 8080;

const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE
});

const bucket = storage.bucket(CLOUD_BUCKET);

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // no larger than 5mb
  }
});

const app = express();

app.use('/blog', express.static('blog/dist'));

app.get('/', async (req, res) => {

  console.log(process.env);

  const [files] = await bucket.getFiles();

  res.writeHead(200, { 'Content-Type': 'text/html' });

  files.forEach(file => {
    res.write(`<div>* ${file.name}</div>`);
    console.log(file.name);
  });

  return res.end();

});

app.get("/gupload", (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

// Process the file upload and upload to Google Cloud Storage.
app.post("/pupload", multer.single("file"), (req, res, next) => {

  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);

  // Make sure to set the contentType metadata for the browser to be able
  // to render the image instead of downloading the file (default behavior)
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on("error", err => {
    next(err);
    return;
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    // Make the image public to the web (since we'll be displaying it in browser)
    blob.makePublic().then(() => {
      res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`);
    });
  });

  blobStream.end(req.file.buffer);

});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


