import {
    Stack,
    StackProps,
    aws_s3 as s3,
    aws_cloudfront_origins as origins,
    aws_cloudfront as cloudfront,
    CfnOutput,
} from 'aws-cdk-lib';
  
import { Construct } from 'constructs';

interface CustomizableStack extends StackProps {
  bucketBaseName?: string;
  regions: Array<string>;
}

export class CdnStackAlisson extends Stack {
  constructor(scope: Construct, id: string, props?: CustomizableStack) {
    super(scope, id, props);

    const BASE_NAME = props?.bucketBaseName as string;
    const REGIONS = props?.regions as Array<string>;

    const defaultBehaviorBucket = s3.Bucket.fromBucketAttributes(
      this,
      `${REGIONS[0]}-default-imported-bucket-from-attributes`,
      {
          bucketName: `${REGIONS[0]}-${BASE_NAME}`,
          region: REGIONS[0],
      }
    );
  
    const cf = new cloudfront.Distribution(this, "cdnDistribution", {
      defaultBehavior: { origin: new origins.S3Origin(defaultBehaviorBucket) },
    });

    new CfnOutput(this, "cdnUrl", {value:cf.distributionDomainName})

    REGIONS.forEach((region) => {
      const bucket = s3.Bucket.fromBucketAttributes(
        this,
        `${region}-imported-bucket-from-attributes`,
        {
            bucketName: `${region}-${BASE_NAME}`,
            region,
        }
      );
      const origin = new origins.S3Origin(bucket);
      cf.addBehavior(`/${region}/*`, origin)
    });
  }
}