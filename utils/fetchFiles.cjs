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
const now = new Date();
const data = [];

// This is defined here as it is shared between calls to 
// different domains and calls to files of different sizes.
const mutexQuery = new Mutex();

/**
 * Pushes log information that later will be dumped on a .csv file.
 * @param start request start date
 * @param sourceUrl url used to fetch the file
 * @param size size of the fetch file
 * @param status status of the request
 */
const pushData = (start, sourceUrl, size, status) => {
    const time = performance.now() - start;
    data.push({
        ProcessDate : date.format(now, 'YYYY-MM-DD HH:mm:ss'),
        SourceUrl : sourceUrl,
        FileSize : `${size}kb`,
        ElapsedTime : time,
        StatusCode : `${status}`
    });
}

/**
 * Fetch a file with a given size from a given source url.
 * @param size size of the fetch file
 * @param sourceUrl url used to fetch the file
 */

const fetchCall = async (size, sourceUrl) => {
    const release = await mutexQuery.acquire();
    const start = performance.now();
    await axios
        .get(sourceUrl)
        .then(res => {
            pushData(start, sourceUrl, size, res.status);
            release();
        })
        .catch(error => {
            console.error(error);
            pushData(start, sourceUrl, size, error);
            release();
        });
}

/**
 * 
 * @param numIt number of repetitions of the same fetch experiment
 * @param size size of the fetch file
 * @param sourceUrl url used to fetch the file
 */
const makeMultipleFetchCalls = async (numIt, size, sourceUrl) => {
    for (var i = 0; i < numIt; i += 1) {
        await fetchCall(size, sourceUrl);
    }   
}

/**
 * For now, we are fetching the file directly from an S3 bucket or
 * passing through CloudFront (CDN).
 * @param numIt number of repetitions of the same fetch experiment
 * @param size size of the fetch file
 */
const queryFromMultipleSourceUrls = async (numIt, size) => {
    await makeMultipleFetchCalls(numIt, size, `https://${AWS_BUCKET_NAME}/${AWS_REGION}/${size}kb`)
    await makeMultipleFetchCalls(numIt, size, `${CUSTOM_DOMAIN}/${AWS_REGION}/${size}kb`)
}

/**
 * Main function. Query data from multiple source urls and
 * dumps logs on a .csv file to be later analyzed.
 */
const main = async () => {
    const fileSizes = [1, 10, 100, 1000, 10000];
    const mutexFileSizes = new Mutex();

    for (var i = 0; i < fileSizes.length; i += 1) {
        const releaseFileSizes = await mutexFileSizes.acquire();
        await queryFromMultipleSourceUrls(1, fileSizes[i]);
        releaseFileSizes();
    }

    const filename = `log-${AWS_REGION}-` + date.format(now, 'YYYYMMDDHHmmss') + '.csv';
    const ws = fs.createWriteStream(filename, { flag: 'a' });

    fastcsv
        .write(data, { headers: true })
        .pipe(ws);
}

main();