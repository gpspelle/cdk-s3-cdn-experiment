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

  export class CdnStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);

      const SAEast1Bucket = s3.Bucket.fromBucketAttributes(
        this,
        'sa-east-1-imported-bucket-from-name',
        {
            bucketName: 'sa-east-1-latency-test-pfg-unicamp',
            region: 'sa-east-1',
        }
      );

      const USEast1Bucket = s3.Bucket.fromBucketAttributes(
        this,
        'us-east-1-imported-bucket-from-name',
        {
            bucketName: 'us-east-1-latency-test-pfg-unicamp',
            region: 'us-east-1',
        }
      );

      const certificate = acm.Certificate.fromCertificateArn(
        this,
        "Certificate",
        "arn:aws:acm:us-east-1:593593438961:certificate/77f4c833-aa20-446c-9eb2-f01cb5dfeb5c"
      );
    
      const cf = new cloudfront.Distribution(this, "cdnDistribution", {
        defaultBehavior: { origin: new origins.S3Origin(SAEast1Bucket) },
        additionalBehaviors: {
            '/us-east-1/*': {
                origin: new origins.S3Origin(USEast1Bucket),
            },
            '/sa-east-1/*': {
                origin: new origins.S3Origin(SAEast1Bucket),
            },
        },
        domainNames: ["gpspelle.click"],
        certificate,
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