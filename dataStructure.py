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

a = navNode(1, 2, "room", True, "SLC")
# print a.x
# print a.y
# print a.properties
# if (a.visible):
#     print a.visible
#     print a.nodeType
