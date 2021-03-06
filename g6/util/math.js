import { mat3, transform, vec3 } from '@antv/matrix-util';
import isArray from '@antv/util/lib/is-array';
import { each } from '@antv/util';
/**
 * 是否在区间内
 * @param   {number}       value  值
 * @param   {number}       min    最小值
 * @param   {number}       max    最大值
 * @return  {boolean}      bool   布尔
 */

var isBetween = function isBetween(value, min, max) {
  return value >= min && value <= max;
};
/**
 * 获取两条线段的交点
 * @param  {Point}  p0 第一条线段起点
 * @param  {Point}  p1 第一条线段终点
 * @param  {Point}  p2 第二条线段起点
 * @param  {Point}  p3 第二条线段终点
 * @return {Point}  交点
 */


var getLineIntersect = function getLineIntersect(p0, p1, p2, p3) {
  var tolerance = 0.001;
  var E = {
    x: p2.x - p0.x,
    y: p2.y - p0.y
  };
  var D0 = {
    x: p1.x - p0.x,
    y: p1.y - p0.y
  };
  var D1 = {
    x: p3.x - p2.x,
    y: p3.y - p2.y
  };
  var kross = D0.x * D1.y - D0.y * D1.x;
  var sqrKross = kross * kross;
  var sqrLen0 = D0.x * D0.x + D0.y * D0.y;
  var sqrLen1 = D1.x * D1.x + D1.y * D1.y;
  var point = null;

  if (sqrKross > tolerance * sqrLen0 * sqrLen1) {
    var s = (E.x * D1.y - E.y * D1.x) / kross;
    var t = (E.x * D0.y - E.y * D0.x) / kross;

    if (isBetween(s, 0, 1) && isBetween(t, 0, 1)) {
      point = {
        x: p0.x + s * D0.x,
        y: p0.y + s * D0.y
      };
    }
  }

  return point;
};
/**
 * point and rectangular intersection point
 * @param  {IRect} rect  rect
 * @param  {Point} point point
 * @return {PointPoint} rst;
 */


export var getRectIntersectByPoint = function getRectIntersectByPoint(rect, point) {
  var x = rect.x,
      y = rect.y,
      width = rect.width,
      height = rect.height;
  var cx = x + width / 2;
  var cy = y + height / 2;
  var points = [];
  var center = {
    x: cx,
    y: cy
  };
  points.push({
    x: x,
    y: y
  });
  points.push({
    x: x + width,
    y: y
  });
  points.push({
    x: x + width,
    y: y + height
  });
  points.push({
    x: x,
    y: y + height
  });
  points.push({
    x: x,
    y: y
  });
  var rst = null;

  for (var i = 1; i < points.length; i++) {
    rst = getLineIntersect(points[i - 1], points[i], center, point);

    if (rst) {
      break;
    }
  }

  return rst;
};
/**
 * get point and circle inIntersect
 * @param {ICircle} circle 圆点，x,y,r
 * @param {Point} point 点 x,y
 * @return {Point} applied point
 */

export var getCircleIntersectByPoint = function getCircleIntersectByPoint(circle, point) {
  var cx = circle.x,
      cy = circle.y,
      r = circle.r;
  var x = point.x,
      y = point.y;
  var dx = x - cx;
  var dy = y - cy;
  var d = Math.sqrt(dx * dx + dy * dy);

  if (d < r) {
    return null;
  }

  var signX = Math.sign(dx);
  var signY = Math.sign(dy);
  var angle = Math.atan(dy / dx);
  return {
    x: cx + Math.abs(r * Math.cos(angle)) * signX,
    y: cy + Math.abs(r * Math.sin(angle)) * signY
  };
};
/**
 * get point and ellipse inIntersect
 * @param {Object} ellipse 椭圆 x,y,rx,ry
 * @param {Object} point 点 x,y
 * @return {object} applied point
 */

export var getEllipseIntersectByPoint = function getEllipseIntersectByPoint(ellipse, point) {
  var a = ellipse.rx;
  var b = ellipse.ry;
  var cx = ellipse.x;
  var cy = ellipse.y;
  var dx = point.x - cx;
  var dy = point.y - cy; // 直接通过 x,y 求夹角，求出来的范围是 -PI, PI

  var angle = Math.atan2(dy / b, dx / a);

  if (angle < 0) {
    angle += 2 * Math.PI; // 转换到 0，2PI
  }

  return {
    x: cx + a * Math.cos(angle),
    y: cy + b * Math.sin(angle)
  };
};
/**
 * coordinate matrix transformation
 * @param  {number} point   coordinate
 * @param  {Matrix} matrix  matrix
 * @param  {number} tag     could be 0 or 1
 * @return {Point} transformed point
 */

export var applyMatrix = function applyMatrix(point, matrix, tag) {
  if (tag === void 0) {
    tag = 1;
  }

  var vector = [point.x, point.y, tag];

  if (!matrix || isNaN(matrix[0])) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  vec3.transformMat3(vector, vector, matrix);
  return {
    x: vector[0],
    y: vector[1]
  };
};
/**
 * coordinate matrix invert transformation
 * @param  {number} point   coordinate
 * @param  {number} matrix  matrix
 * @param  {number} tag     could be 0 or 1
 * @return {object} transformed point
 */

export var invertMatrix = function invertMatrix(point, matrix, tag) {
  if (tag === void 0) {
    tag = 1;
  }

  if (!matrix || isNaN(matrix[0])) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  var inversedMatrix = mat3.invert([], matrix);

  if (!inversedMatrix) {
    inversedMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  var vector = [point.x, point.y, tag];
  vec3.transformMat3(vector, vector, inversedMatrix);
  return {
    x: vector[0],
    y: vector[1]
  };
};
/**
 *
 * @param p1 First coordinate
 * @param p2 second coordinate
 * @param p3 three coordinate
 */

export var getCircleCenterByPoints = function getCircleCenterByPoints(p1, p2, p3) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;
  var c = p1.x - p3.x;
  var d = p1.y - p3.y;
  var e = (p1.x * p1.x - p2.x * p2.x - p2.y * p2.y + p1.y * p1.y) / 2;
  var f = (p1.x * p1.x - p3.x * p3.x - p3.y * p3.y + p1.y * p1.y) / 2;
  var denominator = b * c - a * d;
  return {
    x: -(d * e - b * f) / denominator,
    y: -(a * f - c * e) / denominator
  };
};
/**
 * get distance by two points
 * @param p1 first point
 * @param p2 second point
 */

export var distance = function distance(p1, p2) {
  var vx = p1.x - p2.x;
  var vy = p1.y - p2.y;
  return Math.sqrt(vx * vx + vy * vy);
};
/**
 * scale matrix
 * @param matrix [ [], [], [] ]
 * @param ratio
 */

export var scaleMatrix = function scaleMatrix(matrix, ratio) {
  var result = [];
  matrix.forEach(function (row) {
    var newRow = [];
    row.forEach(function (v) {
      newRow.push(v * ratio);
    });
    result.push(newRow);
  });
  return result;
};
/**
 * Floyd Warshall algorithm for shortest path distances matrix
 * @param  {array} adjMatrix   adjacency matrix
 * @return {array} distances   shortest path distances matrix
 */

export var floydWarshall = function floydWarshall(adjMatrix) {
  // initialize
  var dist = [];
  var size = adjMatrix.length;

  for (var i = 0; i < size; i += 1) {
    dist[i] = [];

    for (var j = 0; j < size; j += 1) {
      if (i === j) {
        dist[i][j] = 0;
      } else if (adjMatrix[i][j] === 0 || !adjMatrix[i][j]) {
        dist[i][j] = Infinity;
      } else {
        dist[i][j] = adjMatrix[i][j];
      }
    }
  } // floyd


  for (var k = 0; k < size; k += 1) {
    for (var i = 0; i < size; i += 1) {
      for (var j = 0; j < size; j += 1) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  return dist;
};
/**
 * get adjacency matrix
 * @param data graph data
 * @param directed whether it's a directed graph
 */

export var getAdjMatrix = function getAdjMatrix(data, directed) {
  var nodes = data.nodes,
      edges = data.edges;
  var matrix = []; // map node with index in data.nodes

  var nodeMap = {};

  if (!nodes) {
    throw new Error('invalid nodes data!');
  }

  if (nodes) {
    nodes.forEach(function (node, i) {
      nodeMap[node.id] = i;
      var row = [];
      matrix.push(row);
    });
  }

  if (edges) {
    edges.forEach(function (e) {
      var source = e.source,
          target = e.target;
      var sIndex = nodeMap[source];
      var tIndex = nodeMap[target];
      matrix[sIndex][tIndex] = 1;

      if (!directed) {
        matrix[tIndex][sIndex] = 1;
      }
    });
  }

  return matrix;
};
/**
 * 平移group
 * @param group Group 实例
 * @param vec 移动向量
 */

export var translate = function translate(group, vec) {
  group.translate(vec.x, vec.y);
};
/**
 * 移动到指定坐标点
 * @param group Group 实例
 * @param point 移动到的坐标点
 */

export var move = function move(group, point) {
  var matrix = group.getMatrix();

  if (!matrix) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  var bbox = group.getCanvasBBox();
  var vx = point.x - bbox.minX;
  var vy = point.y - bbox.minY;
  var movedMatrix = transform(matrix, [['t', vx, vy]]);
  group.setMatrix(movedMatrix);
};
/**
 * 缩放 group
 * @param group Group 实例
 * @param point 在x 和 y 方向上的缩放比例
 */

export var scale = function scale(group, ratio) {
  var matrix = group.getMatrix();

  if (!matrix) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  var scaleXY = ratio;

  if (!isArray(ratio)) {
    scaleXY = [ratio, ratio];
  }

  if (isArray(ratio) && ratio.length === 1) {
    scaleXY = [ratio[0], ratio[0]];
  }

  matrix = transform(matrix, [['s', scaleXY[0], scaleXY[1]]]);
  group.setMatrix(matrix);
};
/**
 *
 * @param group Group 实例
 * @param ratio 选择角度
 */

export var rotate = function rotate(group, angle) {
  var matrix = group.getMatrix();

  if (!matrix) {
    matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  matrix = transform(matrix, [['r', angle]]);
  group.setMatrix(matrix);
};
export var getDegree = function getDegree(n, nodeIdxMap, edges) {
  var degrees = [];

  for (var i = 0; i < n; i++) {
    degrees[i] = 0;
  }

  edges.forEach(function (e) {
    if (e.source) {
      degrees[nodeIdxMap[e.source]] += 1;
    }

    if (e.target) {
      degrees[nodeIdxMap[e.target]] += 1;
    }
  });
  return degrees;
}; // 判断点Q是否在p1和p2的线段上

function onSegment(p1, p2, q) {
  if ((q[0] - p1[0]) * (p2[1] - p1[1]) === (p2[0] - p1[0]) * (q[1] - p1[1]) && Math.min(p1[0], p2[0]) <= q[0] && q[0] <= Math.max(p1[0], p2[0]) && Math.min(p1[1], p2[1]) <= q[1] && q[1] <= Math.max(p1[1], p2[1])) {
    return true;
  }

  return false;
}
/**
 * 判断点P在多边形内-射线法. Borrow from https://github.com/antvis/util/blob/master/packages/path-util/src/point-in-polygon.ts
 * @param points
 * @param x
 * @param y
 */


export var isPointInPolygon = function isPointInPolygon(points, x, y) {
  var isHit = false;
  var n = points.length; // 判断两个double在eps精度下的大小关系

  var tolerance = 1e-6;

  function dcmp(x) {
    if (Math.abs(x) < tolerance) {
      return 0;
    }

    return x < 0 ? -1 : 1;
  }

  if (n <= 2) {
    // svg 中点小于 3 个时，不显示，也无法被拾取
    return false;
  }

  for (var i = 0; i < n; i++) {
    var p1 = points[i];
    var p2 = points[(i + 1) % n];

    if (onSegment(p1, p2, [x, y])) {
      // 点在多边形一条边上
      return true;
    } // 前一个判断min(p1[1],p2[1])<P.y<=max(p1[1],p2[1])
    // 后一个判断被测点 在 射线与边交点 的左边


    if (dcmp(p1[1] - y) > 0 !== dcmp(p2[1] - y) > 0 && dcmp(x - (y - p1[1]) * (p1[0] - p2[0]) / (p1[1] - p2[1]) - p1[0]) < 0) {
      isHit = !isHit;
    }
  }

  return isHit;
}; // 判断两个BBox是否相交

export var intersectBBox = function intersectBBox(box1, box2) {
  return !(box2.minX > box1.maxX || box2.maxX < box1.minX || box2.minY > box1.maxY || box2.maxY < box1.minY);
};

var lineIntersectPolygon = function lineIntersectPolygon(lines, line) {
  var isIntersect = false;
  each(lines, function (l) {
    if (getLineIntersect(l.from, l.to, line.from, line.to)) {
      isIntersect = true;
      return false;
    }
  });
  return isIntersect;
};
/**
 * 判断两个polygon是否相交。
 * borrow from @antv/path-util
 * @param points1 polygon1的顶点数组
 * @param points2 polygon2的顶点数组
 */


export var isPolygonsIntersect = function isPolygonsIntersect(points1, points2) {
  var getBBox = function getBBox(points) {
    var xArr = points.map(function (p) {
      return p[0];
    });
    var yArr = points.map(function (p) {
      return p[1];
    });
    return {
      minX: Math.min.apply(null, xArr),
      maxX: Math.max.apply(null, xArr),
      minY: Math.min.apply(null, yArr),
      maxY: Math.max.apply(null, yArr)
    };
  };

  var parseToLines = function parseToLines(points) {
    var lines = [];
    var count = points.length;

    for (var i = 0; i < count - 1; i++) {
      var point = points[i];
      var next = points[i + 1];
      lines.push({
        from: {
          x: point[0],
          y: point[1]
        },
        to: {
          x: next[0],
          y: next[1]
        }
      });
    }

    if (lines.length > 1) {
      var first = points[0];
      var last = points[count - 1];
      lines.push({
        from: {
          x: last[0],
          y: last[1]
        },
        to: {
          x: first[0],
          y: first[1]
        }
      });
    }

    return lines;
  }; // 空数组，或者一个点返回 false


  if (points1.length < 2 || points2.length < 2) {
    return false;
  }

  var bbox1 = getBBox(points1);
  var bbox2 = getBBox(points2); // 判定包围盒是否相交，比判定点是否在多边形内要快的多，可以筛选掉大多数情况

  if (!intersectBBox(bbox1, bbox2)) {
    return false;
  }

  var isIn = false; // 判定点是否在多边形内部，一旦有一个点在另一个多边形内，则返回

  each(points2, function (point) {
    if (isPointInPolygon(points1, point[0], point[1])) {
      isIn = true;
      return false;
    }
  });

  if (isIn) {
    return true;
  }

  each(points1, function (point) {
    if (isPointInPolygon(points2, point[0], point[1])) {
      isIn = true;
      return false;
    }
  });

  if (isIn) {
    return true;
  }

  var lines1 = parseToLines(points1);
  var lines2 = parseToLines(points2);
  var isIntersect = false;
  each(lines2, function (line) {
    if (lineIntersectPolygon(lines1, line)) {
      isIntersect = true;
      return false;
    }
  });
  return isIntersect;
};