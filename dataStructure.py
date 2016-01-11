# Define class for all navigation nodes.
# Ensure that there is both x- and y- coordinates, a flag for visibility
# (in the case of hallways, those should be hidden).
# Properties are details of the node.

class navNode(object):
    def __init__(self, x, y, nodeType, visible, properties):
        self.x = x
        self.y = y
        self.nodeType = nodeType
        self.visible = visible
        self.properties = properties

a = navNode(0, 0, "room", True, "SLC")
b = navNode(0, 1, "room", True, "PAC")
c = navNode(2, 6, "room", True, "CIF")
# print a.x
# print a.y
# print a.properties
# if (a.visible):
#     print a.visible
#     print a.nodeType

graph = {   "a" : ["b", "c"],
            "b" : ["a"],
            "c" : ["a"],
            "f" : []
        }

# http://www.python-course.eu/graphs_python.php

def find_path(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return path
    if not graph.has_key(start):
        return None
    for node in graph[start]:
        if node not in path:
            newpath = find_path(graph, node, end, path)
            if newpath: return newpath
    return None
