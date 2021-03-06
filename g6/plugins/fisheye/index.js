import { __assign, __extends } from "tslib";
import { clone } from '@antv/util/lib';
import Base from '../base';
var lensDelegateStyle = {
  stroke: '#000',
  strokeOpacity: 0.8,
  lineWidth: 2,
  fillOpacity: 0.1,
  fill: '#ccc'
};

var Fisheye =
/** @class */
function (_super) {
  __extends(Fisheye, _super);

  function Fisheye(cfg) {
    return _super.call(this, cfg) || this;
  }

  Fisheye.prototype.getDefaultCfgs = function () {
    return {
      trigger: 'mousemove',
      d: 1.5,
      r: 300,
      delegateStyle: clone(lensDelegateStyle),
      showLabel: false
    };
  }; // class-methods-use-this


  Fisheye.prototype.getEvents = function () {
    if (this.get('trigger') === 'mousemove') {
      return {
        'mousemove': 'magnify'
      };
    }

    return {
      'click': 'magnify'
    };
  };

  Fisheye.prototype.init = function () {
    var self = this;
    var r = self.get('r');
    self.set('cachedMagnifiedModels', []);
    self.set('cachedOriginPositions', {});
    self.set('r2', r * r);
  };
  /**
   * mousemove 或 click 事件的响应函数
   * @param param
   */


  Fisheye.prototype.magnify = function (e) {
    var self = this;
    self.restoreCache();
    var graph = self.get('graph');
    var cachedMagnifiedModels = self.get('cachedMagnifiedModels');
    var cachedOriginPositions = self.get('cachedOriginPositions');
    var showLabel = self.get('showLabel');
    var r = self.get('r');
    var r2 = self.get('r2');
    var d = self.get('d');
    var nodes = graph.getNodes();
    var nodeLength = nodes.length;
    var mCenter = {
      x: e.x,
      y: e.y
    };
    self.updateDelegate(mCenter, r);

    for (var i = 0; i < nodeLength; i++) {
      var model = nodes[i].getModel();
      var x = model.x,
          y = model.y;
      if (isNaN(x) || isNaN(y)) continue;
      var dist2 = (x - mCenter.x) * (x - mCenter.x) + (y - mCenter.y) * (y - mCenter.y);

      if (!isNaN(dist2) && dist2 < r2 && dist2 !== 0) {
        var dist = Math.sqrt(dist2);
        var param = dist / r;
        var magnifiedDist = r * (d + 1) * param / (d * param + 1);
        var cos = (x - mCenter.x) / dist;
        var sin = (y - mCenter.y) / dist;
        model.x = cos * magnifiedDist + mCenter.x;
        model.y = sin * magnifiedDist + mCenter.y;

        if (!cachedOriginPositions[model.id]) {
          cachedOriginPositions[model.id] = {
            x: x,
            y: y,
            texts: []
          };
        }

        cachedMagnifiedModels.push(model);

        if (showLabel && 2 * dist < r) {
          var node = nodes[i];
          var nodeGroup = node.getContainer();
          var shapes = nodeGroup.getChildren();
          var shapeLength = shapes.length;

          for (var j = 0; j < shapeLength; j++) {
            var shape = shapes[j];

            if (shape.get('type') === 'text') {
              cachedOriginPositions[model.id].texts.push({
                visible: shape.get('visible'),
                shape: shape
              });
              shape.set('visible', true);
            }
          }
        }
      }
    }

    graph.refreshPositions();
  };
  /**
   * 恢复缓存的被缩放的节点
   */


  Fisheye.prototype.restoreCache = function () {
    var self = this;
    var cachedMagnifiedModels = self.get('cachedMagnifiedModels');
    var cachedOriginPositions = self.get('cachedOriginPositions');
    var cacheLength = cachedMagnifiedModels.length;

    for (var i = 0; i < cacheLength; i++) {
      var node = cachedMagnifiedModels[i];
      var id = node.id;
      var ori = cachedOriginPositions[id];
      node.x = ori.x;
      node.y = ori.y;
      ori.texts.forEach(function (text) {
        text.shape.set('visible', text.visible);
      });
    }

    self.set('cachedMagnifiedModels', []);
    self.set('cachedOriginPositions', {});
  };

  Fisheye.prototype.updateParams = function (cfg) {
    var self = this;
    var r = cfg.r,
        d = cfg.d,
        trigger = cfg.trigger;

    if (!isNaN(cfg.r)) {
      self.set('r', r);
      self.set('r2', r * r);
    }

    if (!isNaN(d)) {
      self.set('d', d);
    }

    if (trigger === 'mousemove' || trigger === 'click') {
      self.set('trigger', trigger);
    }
  };
  /**
   * 放大镜的图形
   * @param {Point} mCenter
   * @param {number} r
   */


  Fisheye.prototype.updateDelegate = function (mCenter, r) {
    var self = this;
    var graph = self.get('graph');
    var lensDelegate = self.get('delegate');

    if (!lensDelegate || lensDelegate.destroyed) {
      // 拖动多个
      var parent_1 = graph.get('group');
      var attrs = self.get('delegateStyle') || lensDelegateStyle; // model上的x, y是相对于图形中心的，delegateShape是g实例，x,y是绝对坐标

      lensDelegate = parent_1.addShape('circle', {
        attrs: __assign({
          r: r / 1.5,
          x: mCenter.x,
          y: mCenter.y
        }, attrs),
        name: 'lens-delegate-shape'
      });
      lensDelegate.set('capture', false);
    } else {
      lensDelegate.attr({
        x: mCenter.x,
        y: mCenter.y
      });
    }

    self.set('delegate', lensDelegate);
  };

  Fisheye.prototype.clear = function () {
    var graph = this.get('graph');
    this.restoreCache();
    graph.refreshPositions();
    var lensDelegate = this.get('delegate');
    lensDelegate.remove();
    lensDelegate.destroy();
  };

  Fisheye.prototype.destroy = function () {
    this.clear();
  };

  return Fisheye;
}(Base);

export default Fisheye;