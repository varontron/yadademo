#!/usr/bin/python
import sys
import json
import requests
import datetime

# {"status":"REQUEST_SUCCEEDED","responseTime":77,"message":[],"Results":{
# "series":
# [{"seriesID":"APUA10374714","data":[{"year":"2016","period":"M11","periodName":"November","value":"2.138","footnotes":[{}]},{"year":"2016","period":"M10","periodName":"October","value":"2.151","footnotes":[{}]},{"year":"2016","period":"M09","periodName":"September","value":"2.103","footnotes":[{}]},{"year":"2016","period":"M08","periodName":"August","value":"2.087","footnotes":[{}]},{"year":"2016","period":"M07","periodName":"July","value":"2.150","footnotes":[{}]},{"year":"2016","period":"M06","periodName":"June","value":"2.259","footnotes":[{}]},{"year":"2016","period":"M05","periodName":"May","value":"2.220","footnotes":[{}]},{"year":"2016","period":"M04","periodName":"April","value":"2.098","footnotes":[{}]},{"year":"2016","period":"M03","periodName":"March","value":"1.860","footnotes":[{}]},{"year":"2016","period":"M02","periodName":"February","value":"1.737","footnotes":[{}]},{"year":"2016","period":"M01","periodName":"January","value":"1.903","footnotes":[{}]},{"year":"2015","period":"M12","periodName":"December","value":"2.029","footnotes":[{}]},{"year":"2015","period":"M11","periodName":"November","value":"2.124","footnotes":[{}]},{"year":"2015","period":"M10","periodName":"October","value":"2.131","footnotes":[{}]},{"year":"2015","period":"M09","periodName":"September","value":"2.260","footnotes":[{}]},{"year":"2015","period":"M08","periodName":"August","value":"2.498","footnotes":[{}]},{"year":"2015","period":"M07","periodName":"July","value":"2.679","footnotes":[{}]},{"year":"2015","period":"M06","periodName":"June","value":"2.691","footnotes":[{}]},{"year":"2015","period":"M05","periodName":"May","value":"2.616","footnotes":[{}]},{"year":"2015","period":"M04","periodName":"April","value":"2.332","footnotes":[{}]},{"year":"2015","period":"M03","periodName":"March","value":"2.361","footnotes":[{}]},{"year":"2015","period":"M02","periodName":"February","value":"2.169","footnotes":[{}]},{"year":"2015","period":"M01","periodName":"January","value":"2.209","footnotes":[{}]},{"year":"2014","period":"M12","periodName":"December","value":"2.690","footnotes":[{}]},{"year":"2014","period":"M11","periodName":"November","value":"2.913","footnotes":[{}]},{"year":"2014","period":"M10","periodName":"October","value":"3.199","footnotes":[{}]},{"year":"2014","period":"M09","periodName":"September","value":"3.399","footnotes":[{}]},{"year":"2014","period":"M08","periodName":"August","value":"3.473","footnotes":[{}]},{"year":"2014","period":"M07","periodName":"July","value":"3.637","footnotes":[{}]},{"year":"2014","period":"M06","periodName":"June","value":"3.637","footnotes":[{}]},{"year":"2014","period":"M05","periodName":"May","value":"3.638","footnotes":[{}]},{"year":"2014","period":"M04","periodName":"April","value":"3.533","footnotes":[{}]},{"year":"2014","period":"M03","periodName":"March","value":"3.504","footnotes":[{}]},{"year":"2014","period":"M02","periodName":"February","value":"3.374","footnotes":[{}]},{"year":"2014","period":"M01","periodName":"January","value":"3.396","footnotes":[{}]},{"year":"2013","period":"M12","periodName":"December","value":"3.403","footnotes":[{}]},{"year":"2013","period":"M11","periodName":"November","value":"3.284","footnotes":[{}]},{"year":"2013","period":"M10","periodName":"October","value":"3.348","footnotes":[{}]},{"year":"2013","period":"M09","periodName":"September","value":"3.580","footnotes":[{}]},{"year":"2013","period":"M08","periodName":"August","value":"3.641","footnotes":[{}]},{"year":"2013","period":"M07","periodName":"July","value":"3.593","footnotes":[{}]},{"year":"2013","period":"M06","periodName":"June","value":"3.491","footnotes":[{}]},{"year":"2013","period":"M05","periodName":"May","value":"3.441","footnotes":[{}]},{"year":"2013","period":"M04","periodName":"April","value":"3.497","footnotes":[{}]},{"year":"2013","period":"M03","periodName":"March","value":"3.663","footnotes":[{}]},{"year":"2013","period":"M02","periodName":"February","value":"3.685","footnotes":[{}]},{"year":"2013","period":"M01","periodName":"January","value":"3.420","footnotes":[{}]},{"year":"2012","period":"M12","periodName":"December","value":"3.410","footnotes":[{}]},{"year":"2012","period":"M11","periodName":"November","value":"3.585","footnotes":[{}]},{"year":"2012","period":"M10","periodName":"October","value":"3.829","footnotes":[{}]},{"year":"2012","period":"M09","periodName":"September","value":"3.836","footnotes":[{}]},{"year":"2012","period":"M08","periodName":"August","value":"3.678","footnotes":[{}]},{"year":"2012","period":"M07","periodName":"July","value":"3.466","footnotes":[{}]},{"year":"2012","period":"M06","periodName":"June","value":"3.468","footnotes":[{}]},{"year":"2012","period":"M05","periodName":"May","value":"3.736","footnotes":[{}]},{"year":"2012","period":"M04","periodName":"April","value":"3.861","footnotes":[{}]},{"year":"2012","period":"M03","periodName":"March","value":"3.720","footnotes":[{}]},{"year":"2012","period":"M02","periodName":"February","value":"3.569","footnotes":[{}]},{"year":"2012","period":"M01","periodName":"January","value":"3.384","footnotes":[{}]},{"year":"2011","period":"M12","periodName":"December","value":"3.249","footnotes":[{}]},{"year":"2011","period":"M11","periodName":"November","value":"3.381","footnotes":[{}]},{"year":"2011","period":"M10","periodName":"October","value":"3.434","footnotes":[{}]},{"year":"2011","period":"M09","periodName":"September","value":"3.595","footnotes":[{}]},{"year":"2011","period":"M08","periodName":"August","value":"3.674","footnotes":[{}]},{"year":"2011","period":"M07","periodName":"July","value":"3.711","footnotes":[{}]},{"year":"2011","period":"M06","periodName":"June","value":"3.738","footnotes":[{}]},{"year":"2011","period":"M05","periodName":"May","value":"3.932","footnotes":[{}]},{"year":"2011","period":"M04","periodName":"April","value":"3.741","footnotes":[{}]},{"year":"2011","period":"M03","periodName":"March","value":"3.447","footnotes":[{}]},{"year":"2011","period":"M02","periodName":"February","value":"3.158","footnotes":[{}]},{"year":"2011","period":"M01","periodName":"January","value":"3.097","footnotes":[{}]}]}]
# }}

# YADA config
YADA_HOST = "yada-test.qdss.io"
YADA_PORT = ""
YADA = "http://"+YADA_HOST+":"+YADA_PORT+"/yada.jsp?"

# couchdb config
COUCHDB_HOST = "yada-test.qdss.io"
COUCHDB_PORT = "5984"
COUCHDB = "http://"+COUCHDB_HOST+":"+COUCHDB_PORT

# date stuff
now   = datetime.datetime.now()
YEAR  = str(now.year)
MONTH = now.month

# check that couchdb is running
url       = COUCHDB
response  = requests.get(url)
SERVER_UP = json.loads(response.text)['couchdb'] == "Welcome"

if SERVER_UP: # it's running
    # get the bls data (should be once a day)
    url        = YADA+"q=BLS+select+to+date&p="+YEAR
    response   = requests.get(url)
    YADAresult = json.loads(response.text)["RESULTSET"]["ROWS"][0]
    result     = json.loads(YADAresult)

    # if request succeeded, proceed
    if result["status"] == "REQUEST_SUCCEEDED":
        blsData = json.loads(YADAresult)["Results"]["series"][0]["data"]

        # get existing data set:  {"total_rows":0,"offset":0,"rows":[]}
        url      = COUCHDB+"/gas/_temp_view"
        payload  = {"map":"function(doc){ emit(doc.year+doc.period.slice(1),(Math.round(doc.value*100)/100).toFixed(2))}"}
        response = requests.post(url,json=payload)
        docs     = json.loads(response.text)
        rows     = {}

        # map stored data into hash
        for i in range(0,len(docs["rows"])):
            rows[docs["rows"][i]["key"]] = docs["rows"][i]["value"]

        # interate over results and check for new
        for i in range (0,len(blsData)):
            yrmo      = blsData[i]["year"]+blsData[i]["period"][1:]
            if rows.get(yrmo,"Nope") == "Nope":
                url       = COUCHDB+"/_uuids"
                response  = requests.get(url)
                uuid      = json.loads(response.text)["uuids"][0]

                # put the new document
                url       = COUCHDB+"/gas/"+uuid
                payload   = {"year":blsData[i]["year"],
                             "period":blsData[i]["period"],
                             "value":blsData[i]["value"]}
                print "loading "+str(payload)
                response  = requests.put(url,json=payload);
