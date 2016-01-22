# http://geojsonlint.com/

import requests

validate_endpoint = 'http://geojsonlint.com/validate'
good_geojson = '{"type": "Point", "coordinates": [-100, 80]}'
bad_geojson = '{"type": "Rhombus", "coordinates": [[1, 2], [3, 4], [5, 6]]}'

good_request = requests.post(validate_endpoint, data=good_geojson)
bad_request = requests.post(validate_endpoint, data=bad_geojson)

print good_request.json()
# {u'status': u'ok'}
print bad_request.json()
# {u'status': u'error', u'message': u'"Rhombus" is not a valid GeoJSON type.'}
