#https://github.com/uWaterloo/api-documentation/blob/master/v2/buildings/building_acronym.md

from uwaterlooapi import UWaterlooAPI
uw = UWaterlooAPI(api_key="2a7eb4185520ceff7b74992e7df4f55e")
print (uw.current_weather())
