import os
from datetime import datetime
from subprocess import Popen
from dotenv import load_dotenv

load_dotenv()

CUSTOM_DOMAIN = os.getenv('CUSTOM_DOMAIN')
AWS_BUCKET_BASE_NAME = os.getenv('AWS_BUCKET_BASE_NAME')

REGIONS = ['sa-east-1','us-east-1','af-south-1','eu-west-1','ap-northeast-1','ap-southeast-2']

filename = 'log-traceroute-'+datetime.now().strftime('%Y%m%d%H%M%S')+'.log'
logfile = open(filename,'a')

def tracer(host=None):
    logfile.write('##########################################################################################\n')
    logfile.flush()
    p = Popen(['traceroute', host, '-I', '-m', '50'], stdout=logfile)
    p.wait()


urlCDN = CUSTOM_DOMAIN.replace('https://','')
print(urlCDN)
tracer(urlCDN)

for AWS_REGION in REGIONS:
    urlBucket = '{}-{}.s3.{}.amazonaws.com'.format(AWS_REGION,AWS_BUCKET_BASE_NAME,AWS_REGION)
    print(urlBucket)
    tracer(urlBucket)

logfile.close()