# Define class for all navigation nodes.
# Ensure that there is both x- and y- coordinates, a flag for visibility
# (in the case of hallways, those should be hidden).
# Properties are details of the node.
from graph_definition import Graph

class navNode(object):
    def __init__(self, x, y, nodeType, visible, properties):
        self.x = x
        self.y = y
        self.nodeType = nodeType
        self.visible = visible
        self.properties = properties

# https://www.python.org/doc/essays/graphs/
def find_all_paths(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return [path]
    if not graph.has_key(start):
        return []
    paths = []
    for node in graph[start]:
        if node not in path:
            newpaths = find_all_paths(graph, node, end, path)
            for newpath in newpaths:
                paths.append(newpath)
    return paths

def find_shortest_path(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return path
    if not graph.has_key(start):
        return None
    shortest = None
    for node in graph[start]:
        if node not in path:
            newpath = find_shortest_path(graph, node, end, path)
            if newpath:
                if not shortest or len(newpath) < len(shortest):
                    shortest = newpath
    return shortest

if __name__ == "__main__":
    SLC = navNode(0, 0, "room", True, "SLC")
    PAC = navNode(0, 1, "room", True, "PAC")
    CIF = navNode(2, 6, "room", True, "CIF")
    QNC = navNode(4, 5, "room", True, "QNC")
    # print a.x
    # print a.y
    # print a.properties
    # if (a.visible):
    #     print a.visible
    #     print a.nodeType

    g = {   "SLC" : ["PAC", "CIF"],
                "PAC" : ["SLC"],
                "CIF" : ["SLC"],
                "QNC" : ["CIF", "PAC", "SLC"],
                "TOOLBOX" : []
        }
    # g = {   SLC : [PAC, CIF],
    #         PAC : [SLC],
    #         CIF : [SLC],
    #         QNC : [CIF, PAC, SLC]
    #     }

    graph = Graph(g)
    print (graph.vertices())
    print '\n\n'
    print(graph.edges())
    #print (find_shortest_path(g, QNC, PAC))
    print (find_shortest_path(g, "QNC", "PAC"))
    print '\n\n\n'
    #print (find_all_paths(g, QNC, PAC))
    print (find_all_paths(g, "QNC", "PAC"))

#not getting edges in my graph.

#problem: need to find a way to add weight to edges. Then I can find the "shortest" path.
