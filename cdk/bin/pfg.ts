#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BucketStack } from '../lib/bucket-stack';
import { CdnStack } from '../lib/cdn-stack';

const app = new cdk.App();
new BucketStack(app, 'BucketStack-sa-east-1', {
  env: { account: '593593438961', region: 'sa-east-1' },
  bucketName: "sa-east-1-latency-test-pfg-unicamp",
});

new BucketStack(app, 'BucketStack-us-east-1', {
  env: { account: '593593438961', region: 'us-east-1' },
  bucketName: "us-east-1-latency-test-pfg-unicamp",
});

new CdnStack(app, 'CdnStack', {
  env: { account: '593593438961', region: 'us-east-1' },
})