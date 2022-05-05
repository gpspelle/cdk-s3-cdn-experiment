#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BucketStack } from '../lib/bucket-stack';
import { CdnStack } from '../lib/cdn-stack';

const app = new cdk.App();

const bucketBaseName = 'latency-test-pfg-unicamp';
// South America
new BucketStack(app, 'BucketStack-sa-east-1', {
  env: { account: '593593438961', region: 'sa-east-1' },
  bucketName: `sa-east-1-${bucketBaseName}`,
});

// North America
new BucketStack(app, 'BucketStack-us-east-1', {
  env: { account: '593593438961', region: 'us-east-1' },
  bucketName: `us-east-1-${bucketBaseName}`,
});

// Africa
new BucketStack(app, 'BucketStack-af-south-1', {
  env: { account: '593593438961', region: 'af-south-1' },
  bucketName: `af-south-1-${bucketBaseName}`,
});

// Asia
new BucketStack(app, 'BucketStack-ap-northeast-1', {
  env: { account: '593593438961', region: 'ap-northeast-1' },
  bucketName: `ap-northeast-1-${bucketBaseName}`,
});

// Europe 
new BucketStack(app, 'BucketStack-eu-west-1', {
  env: { account: '593593438961', region: 'eu-west-1' },
  bucketName: `eu-west-1-${bucketBaseName}`,
});

// Oceania
new BucketStack(app, 'BucketStack-ap-southeast-1', {
  env: { account: '593593438961', region: 'ap-southeast-1' },
  bucketName: `ap-southeast-1-${bucketBaseName}`,
});

const regions = ["sa-east-1", "us-east-1", "af-south-1", "ap-northeast-1", "eu-west-1", "ap-southeast-1"];
new CdnStack(app, 'CdnStack', {
  env: { account: '593593438961', region: 'us-east-1' },
  bucketBaseName,
  regions,
})