import { __extends } from "tslib";
import Base from '../base';
import isString from '@antv/util/lib/is-string';
import createDOM from '@antv/dom-util/lib/create-dom';
import modifyCSS from '@antv/dom-util/lib/modify-css';
import isNil from '@antv/util/lib/is-nil';
;
import { mat3 } from '@antv/matrix-util';
import { applyMatrix } from '../../util/math';

function getImgNaturalDimension(img, callback) {
  var nWidth, nHeight;

  if (img.naturalWidth) {
    // 现代浏览器
    nWidth = img.naturalWidth;
    nHeight = img.naturalHeight;
  } else {
    // IE6/7/8
    var image = new Image();
    image.src = img.src;

    image.onload = function () {
      callback && callback(image.width, image.height);
    };
  }

  return [nWidth, nHeight];
}

var ImageMiniMap =
/** @class */
function (_super) {
  __extends(ImageMiniMap, _super);

  function ImageMiniMap(cfg) {
    return _super.call(this, cfg) || this;
  }

  ImageMiniMap.prototype.getDefaultCfgs = function () {
    return {
      container: null,
      className: 'g6-minimap',
      viewportClassName: 'g6-minimap-viewport',
      width: 200,
      delegateStyle: {
        fill: '#40a9ff',
        stroke: '#096dd9'
      },
      refresh: true
    };
  };

  ImageMiniMap.prototype.getEvents = function () {
    return {
      beforepaint: 'updateViewport',
      beforeanimate: 'disableRefresh',
      afteranimate: 'enableRefresh',
      viewportchange: 'disableOneRefresh'
    };
  }; // 若是正在进行动画，不刷新缩略图


  ImageMiniMap.prototype.disableRefresh = function () {
    this.set('refresh', false);
  };

  ImageMiniMap.prototype.enableRefresh = function () {
    this.set('refresh', true);
    this.updateCanvas();
  };

  ImageMiniMap.prototype.disableOneRefresh = function () {
    this.set('viewportChange', true);
  };

  ImageMiniMap.prototype.initViewport = function () {
    var _this = this;

    var cfgs = this._cfgs; // cWidth and cHeight are the width and height of the minimap's container

    var graph = cfgs.graph;
    if (this.destroyed) return; // const canvas = this.get('canvas');

    var containerDOM = this.get('container');
    var viewport = createDOM("<div class=" + cfgs.viewportClassName + " \n      style='position:absolute;\n        left:0;\n        top:0;\n        box-sizing:border-box;\n        border: 2px solid #1980ff'>\n      </div>"); // 计算拖拽水平方向距离

    var x = 0; // 计算拖拽垂直方向距离

    var y = 0; // 是否在拖拽minimap的视口

    var dragging = false; // 缓存viewport当前对于画布的x

    var left = 0; // 缓存viewport当前对于画布的y

    var top = 0; // 缓存viewport当前宽度

    var width = 0; // 缓存viewport当前高度

    var height = 0;
    var ratio = 0;
    var zoom = 0;
    containerDOM.addEventListener('mousedown', function (e) {
      cfgs.refresh = false;

      if (e.target !== viewport) {
        return;
      } // 如果视口已经最大了，不需要拖拽


      var style = viewport.style;
      width = parseInt(style.width, 10);
      height = parseInt(style.height, 10);

      var cWidth = _this.get('width');

      var cHeight = _this.get('height');

      if (width > cWidth || height > cHeight) {
        return;
      }

      zoom = graph.getZoom();
      ratio = _this.get('ratio');
      dragging = true;
      x = e.clientX;
      y = e.clientY;
    }, false);
    containerDOM.addEventListener('mousemove', function (e) {
      if (!dragging || isNil(e.clientX) || isNil(e.clientY)) {
        return;
      }

      var cWidth = _this.get('width');

      var cHeight = _this.get('height');

      var style = viewport.style;
      left = parseInt(style.left, 10);
      top = parseInt(style.top, 10);
      width = parseInt(style.width, 10);
      height = parseInt(style.height, 10);
      var dx = x - e.clientX;
      var dy = y - e.clientY; // 若视口移动到最左边或最右边了,仅移动到边界

      if (left - dx < 0) {
        dx = left;
      } else if (left - dx + width >= cWidth) {
        dx = 0;
      } // 若视口移动到最上或最下边了，仅移动到边界


      if (top - dy < 0) {
        dy = top;
      } else if (top - dy + height >= cHeight) {
        dy = 0;
      }

      left -= dx;
      top -= dy; // 先移动视口，避免移动到边上以后出现视口闪烁

      modifyCSS(viewport, {
        left: left + "px",
        top: top + "px"
      }); // graph 移动需要偏移量 dx/dy * 缩放比例才会得到正确的移动距离

      graph.translate(dx * zoom / ratio, dy * zoom / ratio);
      x = e.clientX;
      y = e.clientY;
    }, false);
    containerDOM.addEventListener('mouseleave', function () {
      dragging = false;
      cfgs.refresh = true;
    }, false);
    containerDOM.addEventListener('mouseup', function () {
      dragging = false;
      cfgs.refresh = true;
    }, false);
    this.set('viewport', viewport);
    containerDOM.appendChild(viewport);
  };
  /**
   * 更新 viewport 视图
   */


  ImageMiniMap.prototype.updateViewport = function () {
    if (this.destroyed) return;
    var ratio = this.get('ratio');
    var cWidth = this.get('width');
    var cHeight = this.get('height');
    var graph = this.get('graph');
    var graphWidth = graph.get('width');
    var graphHeight = graph.get('height');
    var aspectRatio = graphWidth / graphHeight;
    var graphGroup = graph.getGroup(); // 主图的 bbox（矩阵变换相关的 bbox）

    var graphCanvasBBox = graphGroup.getCanvasBBox(); // 扩展 graphBBox 到和 graphWidth / graphHeight 等比

    var graphCanvasBBoxMean = [(graphCanvasBBox.minX + graphCanvasBBox.maxX) / 2, (graphCanvasBBox.minY + graphCanvasBBox.maxY) / 2];
    var graphCanvasBBoxSize = [graphCanvasBBox.maxX - graphCanvasBBox.minX, graphCanvasBBox.maxY - graphCanvasBBox.minY];
    var expandedGraphCanvasBBox = {
      centerX: graphCanvasBBoxMean[0],
      centerY: graphCanvasBBoxMean[1],
      width: 0,
      height: 0,
      minX: 0,
      minY: 0
    };

    if (graphCanvasBBox[0] / graphCanvasBBox[1] > aspectRatio) {
      expandedGraphCanvasBBox.width = graphCanvasBBoxSize[0];
      expandedGraphCanvasBBox.height = expandedGraphCanvasBBox.width / aspectRatio;
    } else {
      expandedGraphCanvasBBox.height = graphCanvasBBoxSize[1];
      expandedGraphCanvasBBox.width = expandedGraphCanvasBBox.height * aspectRatio;
    }

    expandedGraphCanvasBBox.minX = graphCanvasBBoxMean[0] - expandedGraphCanvasBBox.width / 2;
    expandedGraphCanvasBBox.minY = graphCanvasBBoxMean[1] - expandedGraphCanvasBBox.height / 2;
    var graphMatrix = graphGroup.getMatrix();
    if (!graphMatrix) graphMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    var invertGraphMatrix = mat3.invert([], graphMatrix);
    var minXY = applyMatrix({
      x: expandedGraphCanvasBBox.minX,
      y: expandedGraphCanvasBBox.minY
    }, invertGraphMatrix); // 扩展 graphBBox 后的 bbox 的左上角对应的 canvas container 坐标

    var topLeft = graph.getCanvasByPoint(minXY.x, minXY.y);
    var viewport = this.get('viewport');

    if (!viewport) {
      this.initViewport();
    } // Viewport 与 minimap container 的比例 =  Graph container 与 expandedGraphBBox 比例


    var vpToMc = graphWidth / expandedGraphCanvasBBox.width; // viewport 宽高 = vpToMc * minimap container 宽高

    var width = vpToMc * cWidth;
    var height = vpToMc * cHeight; // vierport 左上角到 minimap container 的距离 / minimap container 宽高 
    // = 主图 expandedBBox 左上角 canvas container 坐标距离 / expandedBBox 宽高

    var left = cWidth * -topLeft.x / expandedGraphCanvasBBox.width;
    var top = cHeight * -topLeft.y / expandedGraphCanvasBBox.height;
    var right = left + width;
    var bottom = top + height;

    if (left < 0) {
      width += left;
      left = 0;
    }

    if (right > cWidth) {
      width = width - (right - cWidth);
    }

    if (top < 0) {
      height += top;
      top = 0;
    }

    if (bottom > cHeight) {
      height = height - (bottom - cHeight);
    } // 缓存目前缩放比，在移动 minimap 视窗时就不用再计算大图的移动量


    this.set('ratio', ratio);
    var correctLeft = left + "px";
    var correctTop = top + "px";
    modifyCSS(viewport, {
      left: correctLeft,
      top: correctTop,
      width: width + "px",
      height: height + "px"
    });
  };

  ImageMiniMap.prototype.init = function () {
    this.initContainer();
  };
  /**
   * 初始化 Minimap 的容器
   */


  ImageMiniMap.prototype.initContainer = function () {
    var self = this;
    var graph = self.get('graph');
    var graphWidth = graph.get('width');
    var graphHeight = graph.get('height');
    var aspectRatio = graphHeight / graphWidth;
    var className = self.get('className');
    var parentNode = self.get('container'); // size of the minimap's container

    var cWidth = self.get('width');
    var cHeight = self.get('height');

    if (!cWidth && !cHeight) {
      cWidth = 200;
    }

    if (cWidth) {
      cHeight = aspectRatio * cWidth;
      self.set('height', cHeight);
    } else {
      cWidth = 1 / aspectRatio * cHeight;
      self.set('width', cWidth);
    }

    var container = createDOM("<div class='" + className + "' style='width: " + cWidth + "px; height: " + cHeight + "px; overflow: hidden; position: relative;'></div>");

    if (isString(parentNode)) {
      parentNode = document.getElementById(parentNode);
    }

    if (parentNode) {
      parentNode.appendChild(container);
    } else {
      graph.get('container').appendChild(container);
    }

    self.set('container', container);
    var containerDOM = createDOM("<div class=\"g6-minimap-container\" style=\"position: relative; width: 100%; height: 100%; text-align: center; display: table;\"></div>");
    container.appendChild(containerDOM);
    var span = createDOM("<span style=\"display: table-cell; vertical-align: middle; \"></span>");
    containerDOM.appendChild(span);
    self.set('containerDOM', containerDOM);
    self.set('containerSpan', span);
    var img = createDOM("<img alt=\"\" src=\"" + this.get('graphImg') + "\" style=\"display: inline-block;\" ondragstart=\"return false;\" onselectstart=\"return false;\"/>");
    self.set('imgDOM', img);
    self.updateImgSize();
    span.appendChild(img);
    self.updateCanvas();
  };

  ImageMiniMap.prototype.updateImgSize = function () {
    var self = this;
    var imgDOM = self.get('imgDOM');
    var cWidth = self.get('width');
    var cHeight = self.get('height');

    imgDOM.onload = function () {
      var naturalSize = getImgNaturalDimension(imgDOM);

      if (naturalSize[0] > naturalSize[1]) {
        imgDOM.width = cWidth;
      } else {
        imgDOM.height = cHeight;
      }
    };
  };

  ImageMiniMap.prototype.updateCanvas = function () {
    // 如果是在动画，则不刷新视图
    var isRefresh = this.get('refresh');

    if (!isRefresh) {
      return;
    }

    var graph = this.get('graph');

    if (graph.get('destroyed')) {
      return;
    } // 如果是视口变换，也不刷新视图，但是需要重置视口大小和位置


    if (this.get('viewportChange')) {
      this.set('viewportChange', false);
      this.updateViewport();
    }

    var cWidth = this.get('width');
    var graphBBox = graph.get('canvas').getCanvasBBox();
    var width = graphBBox.width;
    var ratio = cWidth / width; // // 更新minimap视口

    this.set('ratio', ratio);
    this.updateViewport();
  };
  /**
   * 获取minimap的画布
   * @return {GCanvas} G的canvas实例
   */


  ImageMiniMap.prototype.getCanvas = function () {
    return this.get('canvas');
  };
  /**
   * 获取minimap的窗口
   * @return {HTMLElement} 窗口的dom实例
   */


  ImageMiniMap.prototype.getViewport = function () {
    return this.get('viewport');
  };
  /**
   * 获取minimap的容器dom
   * @return {HTMLElement} dom
   */


  ImageMiniMap.prototype.getContainer = function () {
    return this.get('container');
  };

  ImageMiniMap.prototype.updateGraphImg = function (img) {
    var self = this;
    var oriImgDOM = self.get('imgDOM');
    oriImgDOM.remove();
    self.set('graphImg', img);
    var imgDOM = createDOM("<img alt=\"\" src=\"" + img + "\" style=\"display: inline-block;\" ondragstart=\"return false;\" onselectstart=\"return false;\"/>");
    self.set('imgDOM', imgDOM);
    imgDOM.src = img;
    self.updateImgSize();
    var span = self.get('containerSpan');
    span.appendChild(imgDOM);
    self.updateCanvas();
  };

  ImageMiniMap.prototype.destroy = function () {
    this.get('canvas').destroy();
    var container = this.get('container');
    container.parentNode.removeChild(container);
  };

  return ImageMiniMap;
}(Base);

export default ImageMiniMap;