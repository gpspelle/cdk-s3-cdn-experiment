import { Mutex } from 'async-mutex';
import axios from 'axios';

const {
    AWS_REGION
} = process.env;

const AWS_BUCKET_NAME = `${AWS_REGION}-latency-test-pfg-unicamp.s3.${AWS_REGION}.amazonaws.com`
const CUSTOM_DOMAIN = 'https://gpspelle.click';

const fileSizes = [1, 10, 100, 1000, 10000];
const mutex = new Mutex();

const asyncCall = async (i, size, domain) => {
    const release = await mutex.acquire();
    console.time(`[${i}] Get ${size}kb file`)
    await axios
        .get(domain)
        .then(res => {
            console.timeEnd(`[${i}] Get ${size}kb file`);
            console.log(`statusCode: ${res.status}`);
            // console.log(res);
            release();
        })
        .catch(error => {
            console.timeEnd(`[${i}] Get ${size}kb file`);
            console.error(error);
            release();
        });
}

console.time('Total without CDN')
for (var i = 0; i < 10; i+=1) {
    const size = fileSizes[2];
    await asyncCall(i, size, `https://${AWS_BUCKET_NAME}/${size}kb`);
}
console.timeEnd('Total without CDN')

console.time('Total with CDN')
for (var i = 0; i < 10; i+=1) {
    const size = fileSizes[2];
    await asyncCall(i, size, `${CUSTOM_DOMAIN}/${size}kb`);
}
console.timeEnd('Total with CDN')


