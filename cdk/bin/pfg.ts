#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BucketStack } from '../lib/bucket-stack';
import { CdnStack } from '../lib/cdn-stack';
import { CdnStackAlisson } from '../lib/cdn-stack-alisson';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' })

const { 
  bucketBaseName,
  accountNumber
} = process.env;


const app = new cdk.App();

// South America
new BucketStack(app, 'BucketStack-sa-east-1', {
  env: { account: accountNumber, region: 'sa-east-1' },
  bucketName: `sa-east-1-${bucketBaseName}`,
});

// North America
new BucketStack(app, 'BucketStack-us-east-1', {
  env: { account: accountNumber, region: 'us-east-1' },
  bucketName: `us-east-1-${bucketBaseName}`,
});

// Africa
new BucketStack(app, 'BucketStack-af-south-1', {
  env: { account: accountNumber, region: 'af-south-1' },
  bucketName: `af-south-1-${bucketBaseName}`,
});

// Asia
new BucketStack(app, 'BucketStack-ap-northeast-1', {
  env: { account: accountNumber, region: 'ap-northeast-1' },
  bucketName: `ap-northeast-1-${bucketBaseName}`,
});

// Europe 
new BucketStack(app, 'BucketStack-eu-west-1', {
  env: { account: accountNumber, region: 'eu-west-1' },
  bucketName: `eu-west-1-${bucketBaseName}`,
});

// Oceania
new BucketStack(app, 'BucketStack-ap-southeast-1', {
  env: { account: accountNumber, region: 'ap-southeast-1' },
  bucketName: `ap-southeast-1-${bucketBaseName}`,
});

const regions = ["sa-east-1", "us-east-1", "af-south-1", "ap-northeast-1", "eu-west-1", "ap-southeast-1"];
new CdnStack(app, 'CdnStack', {
  env: { account: accountNumber, region: 'us-east-1' },
  bucketBaseName,
  regions,
})

new CdnStackAlisson(app, 'CdnStackAlisson', {
  env: { account: accountNumber, region: 'us-east-1' },
  bucketBaseName,
  regions,
})