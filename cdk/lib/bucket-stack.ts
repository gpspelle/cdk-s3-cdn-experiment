import {
  Stack,
  StackProps,
  aws_s3 as s3,
  RemovalPolicy,
  Duration,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

interface CustomizableStack extends StackProps {
  bucketName: string;
}

export class BucketStack extends Stack {
  constructor(scope: Construct, id: string, props?: CustomizableStack) {
    super(scope, id, props);

    const BUCKET_NAME = props?.bucketName as string;

    const accessLogsBucketName = BUCKET_NAME + "-access-logs";

    // 👇 create access logs storage S3 bucket
    const accessLogBucket = new s3.Bucket(this, "access-logs-s3-bucket", {
      bucketName: accessLogsBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: Duration.days(90),
          expiration: Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
          ],
        },
      ],
    })

    // 👇 create S3 bucket with real data
    const dataBucket = new s3.Bucket(this, "data-s3-bucket", {
      bucketName: BUCKET_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      serverAccessLogsBucket: accessLogBucket,
      autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: Duration.days(90),
          expiration: Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
          ],
        },
      ],
    })
  }
}
