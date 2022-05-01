const path = require('path');
const fs = require('fs');
const S3 = require("aws-sdk/clients/s3")
const { 
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;

const S3Client = new S3({
    region: AWS_REGION,
});

const uploadFile = async (S3Client, filepath, filename) => {
    const fileContent = fs.readFileSync(filepath);

    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: filename,
        Body: fileContent
    };
    
    try {
        await S3Client.upload(params).promise();
        console.log("Successfuly uploaded file", filepath);
    } catch (error) {
        console.log(error)
        console.error(`Error uploading file ${filepath} to bucket ${AWS_BUCKET_NAME}`);
    }
}

const directoryPath = path.join(__dirname, 'files');
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    } 
    
    files.forEach(function (file) {
        filepath = directoryPath + "/" + file
        console.log("Attempt to upload file", filepath);
        uploadFile(S3Client, filepath, AWS_REGION + "/" + file);
    });
});
