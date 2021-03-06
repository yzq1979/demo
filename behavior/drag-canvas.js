import { cloneEvent, isNaN } from '../util/base';
var abs = Math.abs;
var DRAG_OFFSET = 10;
var ALLOW_EVENTS = ['shift', 'ctrl', 'alt', 'control'];
export default {
  getDefaultCfg: function getDefaultCfg() {
    return {
      direction: 'both',
      enableOptimize: false
    };
  },
  getEvents: function getEvents() {
    return {
      dragstart: 'onMouseDown',
      mousedown: 'onMouseDown',
      drag: 'onMouseMove',
      dragend: 'onMouseUp',
      mouseup: 'onMouseUp',
      'canvas:click': 'onMouseUp',
      keyup: 'onKeyUp',
      focus: 'onKeyUp',
      keydown: 'onKeyDown'
    };
  },
  updateViewport: function updateViewport(e) {
    var origin = this.origin;
    var clientX = +e.clientX;
    var clientY = +e.clientY;

    if (isNaN(clientX) || isNaN(clientY)) {
      return;
    }

    var dx = clientX - origin.x;
    var dy = clientY - origin.y;

    if (this.get('direction') === 'x') {
      dy = 0;
    } else if (this.get('direction') === 'y') {
      dx = 0;
    }

    this.origin = {
      x: clientX,
      y: clientY
    };
    var width = this.graph.get('width');
    var height = this.graph.get('height');
    var graphCanvasBBox = this.graph.get('canvas').getCanvasBBox();

    if (graphCanvasBBox.minX <= width && graphCanvasBBox.minX + dx > width || graphCanvasBBox.maxX >= 0 && graphCanvasBBox.maxX + dx < 0) {
      dx = 0;
    }

    if (graphCanvasBBox.minY <= height && graphCanvasBBox.minY + dy > height || graphCanvasBBox.maxY >= 0 && graphCanvasBBox.maxY + dy < 0) {
      dy = 0;
    }

    this.graph.translate(dx, dy);
    this.graph.paint();
  },
  onMouseDown: function onMouseDown(e) {
    var self = this;

    if (window && window.event && typeof window !== 'undefined' && !window.event.buttons && !window.event.button) {
      return;
    }

    if (self.keydown || e.shape) {
      return;
    }

    self.origin = {
      x: e.clientX,
      y: e.clientY
    };
    self.dragging = false;

    if (this.enableOptimize) {
      // 开始拖动时关闭局部渲染
      var localRefresh = this.graph.get('canvas').get('localRefresh');
      this.oriLocalRefresh = localRefresh;
      this.graph.get('canvas').set('localRefresh', false); // 拖动 canvas 过程中隐藏所有的边及label

      var graph = this.graph;
      var edges = graph.getEdges();

      for (var i = 0, len = edges.length; i < len; i++) {
        graph.hideItem(edges[i]);
      }

      var nodes = graph.getNodes();

      for (var j = 0, nodeLen = nodes.length; j < nodeLen; j++) {
        var container = nodes[j].getContainer();
        var children = container.get('children');

        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
          var child = children_1[_i];
          var isKeyShape = child.get('isKeyShape');

          if (!isKeyShape) {
            child.set('visible', false);
          }
        }
      }
    }
  },
  onMouseMove: function onMouseMove(e) {
    var graph = this.graph;

    if (this.keydown || e.shape) {
      return;
    }

    e = cloneEvent(e);

    if (!this.origin) {
      return;
    }

    if (!this.dragging) {
      if (abs(this.origin.x - e.clientX) + abs(this.origin.y - e.clientY) < DRAG_OFFSET) {
        return;
      }

      if (this.shouldBegin.call(this, e)) {
        e.type = 'dragstart';
        graph.emit('canvas:dragstart', e);
        this.dragging = true;
      }
    } else {
      e.type = 'drag';
      graph.emit('canvas:drag', e);
    }

    if (this.shouldUpdate.call(this, e)) {
      this.updateViewport(e);
    }
  },
  onMouseUp: function onMouseUp(e) {
    var _this = this;

    var graph = this.graph;

    if (this.keydown || e.shape) {
      return;
    }

    if (this.enableOptimize) {
      // 拖动结束后显示所有的边
      var edges = graph.getEdges();

      for (var i = 0, len = edges.length; i < len; i++) {
        graph.showItem(edges[i]);
      }

      var nodes = graph.getNodes();

      for (var j = 0, nodeLen = nodes.length; j < nodeLen; j++) {
        var container = nodes[j].getContainer();
        var children = container.get('children');

        for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
          var child = children_2[_i];
          var isKeyShape = child.get('isKeyShape');

          if (!isKeyShape) {
            child.set('visible', true);
          }
        }
      }

      setTimeout(function () {
        // 拖动结束后开启局部渲染
        var localRefresh = _this.oriLocalRefresh === undefined ? true : _this.oriLocalRefresh;
        graph.get('canvas').set('localRefresh', localRefresh);
      }, 16);
    }

    if (!this.dragging) {
      this.origin = null;
      return;
    }

    e = cloneEvent(e);

    if (this.shouldEnd.call(this, e)) {
      this.updateViewport(e);
    }

    e.type = 'dragend';
    graph.emit('canvas:dragend', e);
    this.endDrag();
  },
  endDrag: function endDrag() {
    this.origin = null;
    this.dragging = false;
    this.dragbegin = false;
  },
  onKeyDown: function onKeyDown(e) {
    var self = this;
    var code = e.key;

    if (!code) {
      return;
    }

    if (ALLOW_EVENTS.indexOf(code.toLowerCase()) > -1) {
      self.keydown = true;
    } else {
      self.keydown = false;
    }
  },
  onKeyUp: function onKeyUp() {
    this.keydown = false;
    this.origin = null;
    this.dragging = false;
    this.dragbegin = false;
  }
};