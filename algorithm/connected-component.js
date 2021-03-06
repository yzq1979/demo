/**
 * Generate all connected components for an undirected graph
 * @param graph
 */
export function detectConnectedComponents(nodes) {
  var allComponents = [];
  var visited = {};
  var nodeStack = [];

  var getComponent = function getComponent(node) {
    nodeStack.push(node);
    visited[node.get('id')] = true;
    var neighbors = node.getNeighbors();

    for (var i = 0; i < neighbors.length; ++i) {
      var neighbor = neighbors[i];

      if (!visited[neighbor.get('id')]) {
        getComponent(neighbor);
      }
    }
  };

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];

    if (!visited[node.get('id')]) {
      //对于无向图进行dfs遍历，每一次调用后都得到一个连通分量
      getComponent(node);
      var component = [];

      while (nodeStack.length > 0) {
        component.push(nodeStack.pop());
      }

      allComponents.push(component);
    }
  }

  return allComponents;
}
/**
 * Tarjan's Algorithm 复杂度  O(|V|+|E|)
 * For directed graph only
 * a directed graph is said to be strongly connected if "every vertex is reachable from every other vertex".
 * refer: http://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
 * @param graph
 * @return a list of strongly connected components
 */

export function detectStrongConnectComponents(nodes) {
  var nodeStack = [];
  var inStack = {}; // 辅助判断是否已经在stack中，减少查找开销

  var indices = {};
  var lowLink = {};
  var allComponents = [];
  var index = 0;

  var getComponent = function getComponent(node) {
    // Set the depth index for v to the smallest unused index
    indices[node.get('id')] = index;
    lowLink[node.get('id')] = index;
    index += 1;
    nodeStack.push(node);
    inStack[node.get('id')] = true; // 考虑每个邻接点

    var neighbors = node.getNeighbors('target').filter(function (n) {
      return nodes.indexOf(n) > -1;
    });

    for (var i = 0; i < neighbors.length; i++) {
      var targetNode = neighbors[i];

      if (!indices[targetNode.get('id')] && indices[targetNode.get('id')] !== 0) {
        getComponent(targetNode); // tree edge

        lowLink[node.get('id')] = Math.min(lowLink[node.get('id')], lowLink[targetNode.get('id')]);
      } else if (inStack[targetNode.get('id')]) {
        // back edge, target node is in the current SCC
        lowLink[node.get('id')] = Math.min(lowLink[node.get('id')], indices[targetNode.get('id')]);
      }
    } // If node is a root node, generate an SCC


    if (lowLink[node.get('id')] === indices[node.get('id')]) {
      var component = [];

      while (nodeStack.length > 0) {
        var tmpNode = nodeStack.pop();
        inStack[tmpNode.get('id')] = false;
        component.push(tmpNode);
        if (tmpNode === node) break;
      }

      if (component.length > 0) {
        allComponents.push(component);
      }
    }
  };

  for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
    var node = nodes_1[_i];

    if (!indices[node.get('id')] && indices[node.get('id')] !== 0) {
      getComponent(node);
    }
  }

  return allComponents;
}
export default function getConnectedComponents(graph, directed) {
  var isDirected = directed === undefined ? graph.get('directed') : directed;
  var nodes = graph.getNodes();
  if (isDirected) return detectStrongConnectComponents(nodes);else return detectConnectedComponents(nodes);
}