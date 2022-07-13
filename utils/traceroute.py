import os
import json
import requests
import socket
from datetime import datetime
from subprocess import Popen
from dotenv import load_dotenv
load_dotenv()

json_file = open("../constants.json")
constants = json.load(json_file)
json_file.close()

CUSTOM_DOMAIN = os.getenv('CUSTOM_DOMAIN')
AWS_BUCKET_BASE_NAME = os.getenv('AWS_BUCKET_BASE_NAME')

####################################################################
##              GENERATE TRACEROUTE OUTPUT FILE                   ##
####################################################################

filename = 'lux-log-traceroute-'+datetime.now().strftime('%Y%m%d%H%M%S')+'.log'
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
    IPAddr = socket.gethostbyname(urlBucket)
    print(IPAddr)
    print(urlBucket)
    tracer(IPAddr)

logfile.close()


####################################################################
##                CHECK FILE FOR IP ADDRESSES                     ##
####################################################################

routes = []
route = []

with open(filename) as parsefile:
    for line in parsefile:
        if line.find("###") >= 0:
            if len(route) > 0:
                routes.append(route[3:])
                route = []
        else:
            if line.find("(") > 0:
                route.append(line[line.find("(")+1:line.find(")")])
    routes.append(route[2:])
    parsefile.close()


####################################################################
##                GET GEOLOCATION DATA FROM IPS                   ##
####################################################################

requesturl = "http://ip-api.com/batch"
datafilename = filename.replace("lux-log-traceroute", "lux-geoloc-results")
responses = []

for currentRoute in routes:
    response = requests.post(requesturl, json=currentRoute).json()
    print(response)
    print("\n")
    responses.append(response)

datafile = open(datafilename, "w")
datafile.write(str(responses))
datafile.close()