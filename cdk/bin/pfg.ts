#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PfgStack } from '../lib/pfg-stack';

const app = new cdk.App();
new PfgStack(app, 'PfgStack', {
  env: { account: '593593438961', region: 'sa-east-1' },
  bucketName: "sa-east-1-latency-test-pfg-unicamp",
});