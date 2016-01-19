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

    def __repr__(self):
        return '#%s' % (self.properties,)

if __name__ == "__main__":
    SLC = navNode(0, 0, "room", True, "SLC")
    PAC = navNode(0, 1, "room", True, "PAC")
    CIF = navNode(-2, 12, "room", True, "CIF")
    OPT = navNode(0, 12, "room", True, "OPT")
    CPH = navNode(10, -5, "room", True, "CPH")
    E2 = navNode(12, -5, "room", True, "E2")

    # print a.x
    # print a.y
    # print a.properties
    # if (a.visible):
    #     print a.visible
    #     print a.nodeType

    G=nx.Graph()

    G.add_edge(SLC, PAC, weight=0.6)
    G.add_edge(SLC, CIF, weight=0.1)
    G.add_edge(CIF, OPT, weight=0.1)
    G.add_edge(CIF, CPH, weight=0.7)
    G.add_edge(CIF, E2, weight=0.9)
    G.add_edge(SLC, OPT, weight=0.3)

    print G.edges()
    print (nx.astar_path(G, SLC, OPT))
    print (nx.astar_path_length(G, SLC, OPT))
    #
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
