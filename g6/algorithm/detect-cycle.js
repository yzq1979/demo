import dfs from './dfs';
import getConnectedComponents, { detectStrongConnectComponents } from './connected-component';

var detectDirectedCycle = function detectDirectedCycle(graph) {
  var cycle = null;
  var dfsParentMap = {}; // 所有没有被访问的节点集合

  var unvisitedSet = {}; // 正在被访问的节点集合

  var visitingSet = {}; // 所有已经被访问过的节点集合

  var visitedSet = {}; // 初始化 unvisitedSet

  graph.getNodes().forEach(function (node) {
    unvisitedSet[node.getID()] = node;
  });
  var callbacks = {
    enter: function enter(_a) {
      var currentNode = _a.current,
          previousNode = _a.previous;

      if (visitingSet[currentNode.getID()]) {
        // 如果当前节点正在访问中，则说明检测到环路了
        cycle = {};
        var currentCycleNode = currentNode;
        var previousCycleNode = previousNode;

        while (previousCycleNode.getID() !== currentNode.getID()) {
          cycle[currentCycleNode.getID()] = previousCycleNode;
          currentCycleNode = previousCycleNode;
          previousCycleNode = dfsParentMap[previousCycleNode.getID()];
        }

        cycle[currentCycleNode.getID()] = previousCycleNode;
      } else {
        // 如果不存在正在访问集合中，则将其放入正在访问集合，并从未访问集合中删除
        visitingSet[currentNode.getID()] = currentNode;
        delete unvisitedSet[currentNode.getID()]; // 更新 DSF parents 列表

        dfsParentMap[currentNode.getID()] = previousNode;
      }
    },
    leave: function leave(_a) {
      var currentNode = _a.current; // 如果所有的节点的子节点都已经访问过了，则从正在访问集合中删除掉，并将其移入到已访问集合中，
      // 同时也意味着当前节点的所有邻居节点都被访问过了

      visitedSet[currentNode.getID()] = currentNode;
      delete visitingSet[currentNode.getID()];
    },
    allowTraversal: function allowTraversal(_a) {
      var nextNode = _a.next; // 如果检测到环路则需要终止所有进一步的遍历，否则会导致无限循环遍历

      if (cycle) {
        return false;
      } // 仅允许遍历没有访问的节点，visitedSet 中的都已经访问过了


      return !visitedSet[nextNode.getID()];
    }
  }; // 开始遍历节点

  while (Object.keys(unvisitedSet).length) {
    // 从第一个节点开始进行 DFS 遍历
    var firsetUnVisitedKey = Object.keys(unvisitedSet)[0];
    dfs(graph, firsetUnVisitedKey, callbacks);
  }

  return cycle;
};
/**
 * 检测无向图中的所有Base cycles
 * refer: https://www.codeproject.com/Articles/1158232/Enumerating-All-Cycles-in-an-Undirected-Graph
 * @param graph
 * @param nodeIds 节点 ID 的数组
 * @param include 包含或排除指定的节点
 * @return [{[key: string]: INode}] 返回一组base cycles
 */


export var detectAllUndirectedCycle = function detectAllUndirectedCycle(graph, nodeIds, include) {
  var _a, _b, _c;

  if (include === void 0) {
    include = true;
  }

  var allCycles = [];
  var components = getConnectedComponents(graph, false); // loop through all connected components

  for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
    var component = components_1[_i];
    if (!component.length) continue;
    var root = component[0];
    var rootId = root.get('id');
    var stack = [root];
    var parent_1 = (_a = {}, _a[rootId] = root, _a);
    var used = (_b = {}, _b[rootId] = new Set(), _b); // walk a spanning tree to find cycles

    while (stack.length > 0) {
      var curNode = stack.pop();
      var curNodeId = curNode.get('id');
      var neighbors = curNode.getNeighbors();

      for (var i = 0; i < neighbors.length; i += 1) {
        var neighbor = neighbors[i];
        var neighborId = neighbor.get('id');

        if (neighborId === curNodeId) {
          // 自环 
          allCycles.push((_c = {}, _c[neighbor.getID()] = curNode, _c));
        } else if (!(neighborId in used)) {
          // visit a new node
          parent_1[neighborId] = curNode;
          stack.push(neighbor);
          used[neighborId] = new Set([curNode]);
        } else if (!used[curNodeId].has(neighbor)) {
          // a cycle found
          var cycleValid = true;
          var cyclePath = [neighbor, curNode];
          var p = parent_1[curNodeId];

          while (used[neighborId].size && !used[neighborId].has(p)) {
            cyclePath.push(p);
            if (p === parent_1[p.getID()]) break;else p = parent_1[p.getID()];
          }

          cyclePath.push(p);

          if (nodeIds && include) {
            // 如果有指定包含的节点
            cycleValid = false;

            if (cyclePath.findIndex(function (node) {
              return nodeIds.indexOf(node.get('id')) > -1;
            }) > -1) {
              cycleValid = true;
            }
          } else if (nodeIds && !include) {
            // 如果有指定不包含的节点
            if (cyclePath.findIndex(function (node) {
              return nodeIds.indexOf(node.get('id')) > -1;
            }) > -1) {
              cycleValid = false;
            }
          } // 把 node list 形式转换为 cycle 的格式


          if (cycleValid) {
            var cycle = {};

            for (var i_1 = 1; i_1 < cyclePath.length; i_1 += 1) {
              cycle[cyclePath[i_1 - 1].getID()] = cyclePath[i_1];
            }

            if (cyclePath.length) cycle[cyclePath[cyclePath.length - 1].getID()] = cyclePath[0];
            allCycles.push(cycle);
          }

          used[neighborId].add(curNode);
        }
      }
    }
  }

  return allCycles;
};
/**
 * Johnson's algorithm, 时间复杂度 O((V + E)(C + 1))$ and space bounded by O(V + E)
 * refer: https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
 * refer: https://networkx.github.io/documentation/stable/_modules/networkx/algorithms/cycles.html#simple_cycles
 * @param graph
 * @param nodeIds 节点 ID 的数组
 * @param include 包含或排除指定的节点
 * @return [{[key: string]: INode}] 返回所有的“simple cycles”
 */

export var detectAllDirectedCycle = function detectAllDirectedCycle(graph, nodeIds, include) {
  if (include === void 0) {
    include = true;
  }

  var path = []; // stack of nodes in current path

  var blocked = new Set();
  var B = []; // remember portions of the graph that yield no elementary circuit

  var allCycles = []; // 辅助函数： unblock all blocked nodes

  var unblock = function unblock(thisNode) {
    var stack = [thisNode];

    while (stack.length > 0) {
      var node = stack.pop();

      if (blocked.has(node)) {
        blocked.delete(node);
        B[node.get('id')].forEach(function (node) {
          stack.push(node);
        });
        B[node.get('id')].clear();
      }
    }
  };

  var circuit = function circuit(node, start, adjList) {
    var closed = false; // whether a path is closed

    if (nodeIds && include === false && nodeIds.indexOf(node.get('id')) > -1) return closed;
    path.push(node);
    blocked.add(node);
    var neighbors = adjList[node.getID()];

    for (var i = 0; i < neighbors.length; i += 1) {
      var neighbor = idx2Node[neighbors[i]];

      if (neighbor === start) {
        var cycle = {};

        for (var i_2 = 1; i_2 < path.length; i_2 += 1) {
          cycle[path[i_2 - 1].getID()] = path[i_2];
        }

        if (path.length) cycle[path[path.length - 1].getID()] = path[0];
        allCycles.push(cycle);
        closed = true;
      } else if (!blocked.has(neighbor)) {
        if (circuit(neighbor, start, adjList)) {
          closed = true;
        }
      }
    }

    if (closed) {
      unblock(node);
    } else {
      for (var i = 0; i < neighbors.length; i += 1) {
        var neighbor = idx2Node[neighbors[i]];

        if (!B[neighbor.get('id')].has(node)) {
          B[neighbor.get('id')].add(node);
        }
      }
    }

    path.pop();
    return closed;
  };

  var nodes = graph.getNodes();
  var node2Idx = {};
  var idx2Node = {}; // Johnson's algorithm 要求给节点赋顺序，先按节点在数组中的顺序

  for (var i = 0; i < nodes.length; i += 1) {
    var node = nodes[i];
    var nodeId = node.getID();
    node2Idx[nodeId] = i;
    idx2Node[i] = node;
  } // 如果有指定包含的节点，则把指定节点排序在前，以便提早结束搜索


  if (nodeIds && include) {
    for (var i = 0; i < nodeIds.length; i++) {
      var nodeId = nodeIds[i];
      node2Idx[nodes[i].getID()] = node2Idx[nodeId];
      node2Idx[nodeId] = 0;
      idx2Node[0] = graph.findById(nodeId);
      idx2Node[node2Idx[nodes[i].getID()]] = nodes[i];
    }
  } // 返回 节点顺序 >= nodeOrder 的强连通分量的adjList


  var getMinComponentAdj = function getMinComponentAdj(components) {
    var _a;

    var minCompIdx;
    var minIdx = Infinity; // Find least component and the lowest node

    for (var i = 0; i < components.length; i += 1) {
      var comp = components[i];

      for (var j = 0; j < comp.length; j++) {
        var nodeIdx_1 = node2Idx[comp[j].getID()];

        if (nodeIdx_1 < minIdx) {
          minIdx = nodeIdx_1;
          minCompIdx = i;
        }
      }
    }

    var component = components[minCompIdx];
    var adjList = [];

    for (var i = 0; i < component.length; i += 1) {
      var node = component[i];
      adjList[node.getID()] = [];

      for (var _i = 0, _b = node.getNeighbors('target').filter(function (n) {
        return component.indexOf(n) > -1;
      }); _i < _b.length; _i++) {
        var neighbor = _b[_i]; // 对自环情况 (点连向自身) 特殊处理：记录自环，但不加入adjList

        if (neighbor === node && !(include === false && nodeIds.indexOf(node.getId()) > -1)) {
          allCycles.push((_a = {}, _a[node.getID()] = node, _a));
        } else {
          adjList[node.getID()].push(node2Idx[neighbor.getID()]);
        }
      }
    }

    return {
      component: component,
      adjList: adjList,
      minIdx: minIdx
    };
  };

  var nodeIdx = 0;

  while (nodeIdx < nodes.length) {
    var subgraphNodes = nodes.filter(function (n) {
      return node2Idx[n.getID()] >= nodeIdx;
    });
    var sccs = detectStrongConnectComponents(subgraphNodes).filter(function (component) {
      return component.length > 1;
    });
    if (sccs.length === 0) break;
    var scc = getMinComponentAdj(sccs);
    var minIdx = scc.minIdx,
        adjList = scc.adjList,
        component = scc.component;

    if (component.length > 1) {
      component.forEach(function (node) {
        B[node.get('id')] = new Set();
      });
      var startNode = idx2Node[minIdx]; // startNode 不在指定要包含的节点中，提前结束搜索

      if (nodeIds && include && nodeIds.indexOf(startNode.get('id')) === -1) return allCycles;
      circuit(startNode, startNode, adjList);
      nodeIdx = minIdx + 1;
    } else {
      break;
    }
  }

  return allCycles;
};
/**
 * 查找图中所有满足要求的圈
 * @param graph
 * @param directed 是否为有向图
 * @param nodeIds 节点 ID 的数组，若不指定，则返回图中所有的圈
 * @param include 包含或排除指定的节点
 * @return [{[key: string]: Node}] 包含所有环的数组，每个环用一个Object表示，其中key为节点id，value为该节点在环中指向的下一个节点
 */

export var detectAllCycles = function detectAllCycles(graph, directed, nodeIds, include) {
  if (include === void 0) {
    include = true;
  }

  if (directed === undefined) {
    directed = graph.get('directed');
  }

  if (directed) return detectAllDirectedCycle(graph, nodeIds, include);else return detectAllUndirectedCycle(graph, nodeIds, include);
};
export default detectDirectedCycle;