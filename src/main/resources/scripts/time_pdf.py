#!/usr/bin/python

import sys
import json
import requests
import re
import numpy as np
from scipy import stats

# Get the data from the ScriptPostprocessor tmp file
data = ""
with open(sys.argv[1],'r') as file:
    data = file.read()

# convert to JSON
rows = json.loads(data)["RESULTSET"]["ROWS"] #

# split the data by Cycling and Driving days
d = []
c = []

for i in range(0,len(rows)):
    matchObj = re.match( r'C',rows[i]['route'] )
    if matchObj:
        c.append(rows[i])
    else:
        d.append(rows[i])

# extract elapsed drive time and create kde
elapsedDrive = [float(o['elapsedTime']) for o in d]
kernelDrive  = stats.gaussian_kde(elapsedDrive,.4)
medDrive     = np.median(elapsedDrive);

# extract elapsed cycling time and create kde
elapsedCyc   = [float(o['elapsedTime']) for o in c]
kernelCyc    = stats.gaussian_kde(elapsedCyc,.4)
medCyc       = np.median(elapsedCyc);

# construct x range
x = np.linspace(70,max(elapsedCyc)+10,1000)
yd = list(kernelDrive(x));
yc = list(kernelCyc(x));
kde_drive, kde_cyc = [],[];
for i in range(0,1000):
    kde_drive.append({'x':float(x[i]),'y':float(yd[i])})
    kde_cyc.append({'x':float(x[i]),'y':float(yc[i])})
print json.dumps({"KDE_drive":kde_drive,"med_drive":medDrive,"KDE_cyc":kde_cyc,"med_cyc":medCyc})
