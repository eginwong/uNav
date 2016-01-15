#Not for use in real code. Just holding ground for interesting snippets of code.

#https://www.python.org/doc/essays/graphs/

# def generate_edges(graph):
#     edges = []
#     for node in graph:
#         for neighbour in graph[node]:
#             edges.append((node, neighbour))
#
#     return edges
#
# print(generate_edges(graph))
#
# def find_isolated_nodes(graph):
#     """ returns a list of isolated nodes. """
#     isolated = []
#     for node in graph:
#         if not graph[node]:
#             isolated += node
#     return isolated
#
# print(find_isolated_nodes(graph))

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

G=nx.Graph()

G.add_edge('SLC','PAC',weight=0.6)
G.add_edge('SLC','CIF',weight=0.1)
G.add_edge('CIF','OPT',weight=0.1)
G.add_edge('CIF','CPH',weight=0.7)
G.add_edge('CIF','E2',weight=0.9)
G.add_edge('SLC','OPT',weight=0.3)

print G.edges()
print (nx.astar_path(G,"SLC", "OPT"))
#
# elarge=[(u,v) for (u,v,d) in G.edges(data=True) if d['weight'] >0.5]
# esmall=[(u,v) for (u,v,d) in G.edges(data=True) if d['weight'] <=0.5]
#
# pos=nx.spring_layout(G) # positions for all nodes
#
# # nodes
# nx.draw_networkx_nodes(G,pos,node_size=700)
#
# # edges
# nx.draw_networkx_edges(G,pos,edgelist=elarge,
#                     width=6)
# nx.draw_networkx_edges(G,pos,edgelist=esmall,
#                     width=6,alpha=0.5,edge_color='PAC',style='dashed')
#
# # labels
# nx.draw_networkx_labels(G,pos,font_size=20,font_family='sans-serif')
#
# plt.axis('off')
# plt.savefig("weighted_graph.png") # save as png
# plt.show() # display
