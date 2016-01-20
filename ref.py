#!/usr/bin/env python
"""
An example using Graph as a weighted network.
"""
__author__ = """Aric Hagberg (hagberg@lanl.gov)"""
try:
    import matplotlib.pyplot as plt
except:
    raise

import networkx as nx
import numpy as numpy

# Define class for all navigation nodes.
# Ensure that there is both x- and y- coordinates, a flag for visibility
# (in the case of hallways, those should be hidden).
# Properties are details of the node.
class navNode(object):
    def __init__(self, x, y, nodeType, visible, properties):
        self.coordinates = numpy.array((x,y))
        self.nodeType = nodeType
        self.visible = visible
        self.properties = properties

    def __repr__(self):
        return '#%s' % (self.properties)

def distWeight(A, B):
    return numpy.linalg.norm(A.coordinates - B.coordinates)

if __name__ == "__main__":
    SLC = navNode(0, 0, "room", True, "SLC")
    PAC = navNode(0, 1, "room", True, "PAC")
    CIF = navNode(-2, 12, "room", True, "CIF")
    OPT = navNode(0, 12, "room", True, "OPT")
    CPH = navNode(10, -5, "room", True, "CPH")
    E2 = navNode(12, -5, "room", True, "E2")

    G=nx.Graph()

    G.add_edge(SLC, PAC, weight=(distWeight(SLC, PAC)))
    G.add_edge(SLC, CIF, weight=(distWeight(SLC, CIF)))
    G.add_edge(CIF, OPT, weight=(distWeight(CIF, OPT)))
    G.add_edge(CIF, CPH, weight=(distWeight(CIF, CPH)))
    G.add_edge(CIF, E2, weight=(distWeight(CIF, E2)))
    G.add_edge(SLC, OPT, weight=(distWeight(SLC, OPT)))

    print G.edges()
    print (nx.astar_path(G, SLC, OPT))
    print (nx.astar_path_length(G, SLC, OPT))

    elarge=[(u,v) for (u,v,d) in G.edges(data=True) if d['weight'] >0.5]
    esmall=[(u,v) for (u,v,d) in G.edges(data=True) if d['weight'] <=0.5]
    #
    pos=nx.spring_layout(G) # positions for all nodes

    # nodes
    nx.draw_networkx_nodes(G,pos,node_size=1000)
    #
    # # edges
    nx.draw_networkx_edges(G,pos,edgelist=elarge,
    width=6)
    nx.draw_networkx_edges(G,pos,edgelist=esmall,
    width=6,alpha=0.5,edge_color='red',style='dashed')

    # labels
    nx.draw_networkx_labels(G,pos,font_size=10,font_family='sans-serif')

    plt.axis('on')
    plt.savefig("weighted_graph.png") # save as png
    plt.show() # display
