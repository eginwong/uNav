#https://github.com/uWaterloo/api-documentation/blob/master/v2/buildings/building_acronym.md

from uwaterlooapi import UWaterlooAPI
import re
uw = UWaterlooAPI(api_key="2a7eb4185520ceff7b74992e7df4f55e")
life = uw.building_list()

# for i in life:
#     for j in len(life):
#         print i[j][u'building_name']

def search(values, searchFor):
    retValues = []
    for k in values:
        if re.match(searchFor, k[u'building_name'], re.I):
            retValues.append(k)
    if not retValues:
        return None
    else:
        return retValues

#regex expressions
print search(life, 'Bio*') #prints firstName
