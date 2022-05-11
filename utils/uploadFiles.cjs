const path = require('path');
const fs = require('fs');
const S3 = require("aws-sdk/clients/s3")
require('dotenv').config()

const { 
  AWS_REGION,
  AWS_BUCKET_BASE_NAME,
} = process.env;

const S3Client = new S3({
    region: AWS_REGION,
});

const AWS_BUCKET_NAME = `${AWS_REGION}-${AWS_BUCKET_BASE_NAME}`;
const directoryPath = path.join(__dirname, 'files');

/**
 * Upload file to S3 bucket
 * @param S3Client aws sdk s3 client
 * @param filepath file path where the file is locally located
 * @param filename name of the file to be uploaded
 */
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
        throw new Error(`Error uploading file ${filepath} to bucket ${AWS_BUCKET_NAME}.\nError message: ${error}`);
    }
}

/**
 * Main function. Read files from local folder and attempt
 * to upload them to S3 bucket. 
 */
const main = () => {
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.error('Unable to scan directory: ' + err);
            return;
        }

        files.forEach(function (file) {
            filepath = directoryPath + "/" + file
            console.log("Attempt to upload file", filepath);
            uploadFile(S3Client, filepath, AWS_REGION + "/" + file);
        });
    });
}

main();