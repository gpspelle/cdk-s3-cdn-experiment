import {
  Stack,
  StackProps,
  aws_s3 as s3,
  RemovalPolicy,
  Duration,
  aws_cloudfront_origins as origins,
  aws_certificatemanager as acm,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_cloudfront as cloudfront,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

interface CustomizableStack extends StackProps {
  bucketName: string;
}

export class PfgStack extends Stack {
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

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:us-east-1:593593438961:certificate/77f4c833-aa20-446c-9eb2-f01cb5dfeb5c"
    );

    const cf = new cloudfront.Distribution(this, "cdnDistribution", {
      defaultBehavior: { origin: new origins.S3Origin(dataBucket) },
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
