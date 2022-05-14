import os
import json
from datetime import datetime
from subprocess import Popen
from dotenv import load_dotenv
load_dotenv()

json_file = open("../constants.json")
constants = json.load(json_file)
json_file.close()

CUSTOM_DOMAIN = os.getenv('CUSTOM_DOMAIN')
AWS_BUCKET_BASE_NAME = os.getenv('AWS_BUCKET_BASE_NAME')

filename = 'log-traceroute-'+datetime.now().strftime('%Y%m%d%H%M%S')+'.log'
logfile = open(filename,'a')

def tracer(host=None):
    logfile.write('##########################################################################################\n')
    logfile.flush()
    p = Popen(['traceroute', '-I', '-m', '50', host], stdout=logfile)
    p.wait()


urlCDN = CUSTOM_DOMAIN.replace('https://','')
print(urlCDN)
tracer(urlCDN)

for AWS_REGION in constants['regions']:
    urlBucket = '{}-{}.s3.{}.amazonaws.com'.format(AWS_REGION,AWS_BUCKET_BASE_NAME,AWS_REGION)
    print(urlBucket)
    tracer(urlBucket)

logfile.close()