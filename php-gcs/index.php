<?php

# Includes the autoloader for libraries installed with composer
require __DIR__ . '/vendor/autoload.php';

use Google\Cloud\Storage\StorageClient;
use google\appengine\api\cloud_storage\CloudStorageTools;

# Your Google Cloud Platform project ID
$projectId = 'test-nodejs-229006';

# Instantiates a client
$storage = new StorageClient([
    'projectId' => $projectId,
    'keyFilePath' => 'test-nodejs-8974b7716f56.json'
]);

# The name for the new bucket
$bucket = $storage->bucket('test_aslam');

// $options = ['gs_bucket_name' => $bucket];
// $upload_url = CloudStorageTools::createUploadUrl('/upload/handler', $options);

foreach ($bucket->objects() as $object) {
    echo "https://storage.googleapis.com/".$bucket->name()."/".$object->name().'<br>';
}

// echo $upload_url;

if(isset($_POST['submit'])) {

    $file = file_get_contents($_FILES['file']['tmp_name']);
    $objectName = $_FILES["file"]["name"];

    $object = $bucket->upload($file, [
        'name' => $objectName
    ]);

    echo "https://storage.googleapis.com/".$bucket->name()."/".$objectname;
}
?>

<html>

<head>
  <title>Example Google Cloud Storage Node App</title>
  <style>
    div {
    width: 600px;
    margin: 40px auto;
  }
  input {
    display: block;
  }
  </style>
</head>

<body>
  <div>
    <form action="" method="post" enctype="multipart/form-data">
      <input type="file" name="file">
      <input type="submit" value="Upload Image" name="submit">
    </form>
  </div>
</body>

</html>