import {
    Stack,
    StackProps,
    aws_s3 as s3,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_cloudfront as cloudfront,
} from 'aws-cdk-lib';
  
import { Construct } from 'constructs';

interface CustomizableStack extends StackProps {
  bucketBaseName: string;
  regions: Array<string>;
}

const getBucketFromAttributes = (scope: Construct, baseName: string, region: string) => {
  return 
}

export class CdnStack extends Stack {
  constructor(scope: Construct, id: string, props?: CustomizableStack) {
    super(scope, id, props);

    const BASE_NAME = props?.bucketBaseName as string;
    const REGIONS = props?.regions as Array<string>;

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:us-east-1:593593438961:certificate/77f4c833-aa20-446c-9eb2-f01cb5dfeb5c"
    );

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
      //domainNames: ["gpspelle.click"],
      certificate,
    });

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

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "gpspelle-zone",
      {
        zoneName: "gpspelle.click",
        hostedZoneId: "Z07377551VG5S1TR9OXPT",
      }
    );
  
    // Adding out A Record code
    new route53.ARecord(this, "CDNARecord", {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });
  
    new route53.AaaaRecord(this, "AliasRecord", {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });
  }
}