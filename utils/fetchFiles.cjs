const { Mutex } = require('async-mutex');
const axios = require('axios');
const {performance} = require('perf_hooks');
const date = require('date-and-time');
const fastcsv = require('fast-csv');
const fs = require('fs');
require('dotenv').config()

const {
    AWS_REGION,
    AWS_BUCKET_BASE_NAME,
    CUSTOM_DOMAIN,
} = process.env;

const AWS_BUCKET_NAME = `${AWS_REGION}-${AWS_BUCKET_BASE_NAME}.s3.${AWS_REGION}.amazonaws.com`

const fileSizes = [1, 10, 100, 1000, 10000];
const mutex = new Mutex();

const now = new Date();

var filename = `log-${AWS_REGION}-`+date.format(now, 'YYYYMMDDHHmmss')+'.csv';

const ws = fs.createWriteStream(filename, { flag: 'a' });

data = [];

const asyncCall = async (i, size, domain) => {
    const release = await mutex.acquire();
    console.time(`[${i}] Get ${size}kb file`)
    var start = performance.now();
    await axios
        .get(domain)
        .then(res => {
            console.timeEnd(`[${i}] Get ${size}kb file`);
            console.log(`statusCode: ${res.status}`);
            var end = performance.now();
            var time = end - start;
            data.push({
                ProcessDate : date.format(now, 'YYYY-MM-DD HH:mm:ss'),
                SourceUrl : domain,
                FileSize : `${size}kb`,
                ElapsedTime : time,
                StatusCode : `${res.status}`
            });
            release();
        })
        .catch(error => {
            console.timeEnd(`[${i}] Get ${size}kb file`);
            console.error(error);
            var end = performance.now();
            var time = end - start;
            data.push({
                ProcessDate : date.format(now, 'YYYY-MM-DD HH:mm:ss'),
                SourceUrl : domain,
                FileSize : `${size}kb`,
                ElapsedTime : time,
                StatusCode : error
            });
            release();
        });
}

const makeQueries = async (size, numIt) => {
    console.time('Total without CDN')
    for (var i = 0; i < numIt; i+=1) {
        await asyncCall(i, size, `https://${AWS_BUCKET_NAME}/${AWS_REGION}/${size}kb`);
    }
    console.timeEnd('Total without CDN')
    
    console.time('Total with CDN')
    for (var i = 0; i < numIt; i+=1) {
        await asyncCall(i, size, `${CUSTOM_DOMAIN}/${AWS_REGION}/${size}kb`);
    }
    console.timeEnd('Total with CDN')
    fastcsv
        .write(data, { headers: true })
        .pipe(ws);
}

makeQueries(fileSizes[2], 10);



