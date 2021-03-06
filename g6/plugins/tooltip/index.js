import { __extends } from "tslib";
import modifyCSS from '@antv/dom-util/lib/modify-css';
import createDOM from '@antv/dom-util/lib/create-dom';
import isString from '@antv/util/lib/is-string';
import insertCss from 'insert-css';
import Base from '../base';
insertCss("\n  .g6-component-tooltip {\n    border: 1px solid #e2e2e2;\n    border-radius: 4px;\n    font-size: 12px;\n    color: #545454;\n    background-color: rgba(255, 255, 255, 0.9);\n    padding: 10px 8px;\n    box-shadow: rgb(174, 174, 174) 0px 0px 10px;\n  }\n  .tooltip-type {\n    padding: 0;\n    margin: 0;\n  }\n  .tooltip-id {\n    color: #531dab;\n  }\n");

var Tooltip =
/** @class */
function (_super) {
  __extends(Tooltip, _super);

  function Tooltip(cfg) {
    return _super.call(this, cfg) || this;
  }

  Tooltip.prototype.getDefaultCfgs = function () {
    return {
      offsetX: 6,
      offsetY: 6,
      // 指定菜单内容，function(e) {...}
      getContent: function getContent(e) {
        return "\n          <h4 class='tooltip-type'>\u7C7B\u578B\uFF1A" + e.item.getType() + "</h4>\n          <span class='tooltip-id'>ID\uFF1A" + e.item.getID() + "</span>\n        ";
      },
      shouldBegin: function shouldBegin(e) {
        return true;
      },
      itemTypes: ['node', 'edge', 'combo']
    };
  }; // class-methods-use-this


  Tooltip.prototype.getEvents = function () {
    return {
      'node:mouseenter': 'onMouseEnter',
      'node:mouseleave': 'onMouseLeave',
      'node:mousemove': 'onMouseMove',
      'edge:mouseenter': 'onMouseEnter',
      'edge:mouseleave': 'onMouseLeave',
      'edge:mousemove': 'onMouseMove',
      'afterremoveitem': 'onMouseLeave'
    };
  };

  Tooltip.prototype.init = function () {
    var className = this.get('className');
    var tooltip = createDOM("<div class=" + (className || 'g6-component-tooltip') + "></div>");
    var container = this.get('container');

    if (!container) {
      container = this.get('graph').get('container');
    }

    modifyCSS(tooltip, {
      position: 'absolute',
      visibility: 'hidden'
    });
    container.appendChild(tooltip);
    this.set('tooltip', tooltip);
  };

  Tooltip.prototype.onMouseEnter = function (e) {
    var shouldBegin = this.get('shouldBegin');
    if (!shouldBegin(e)) return;
    var itemTypes = this.get('itemTypes');
    if (e.item && e.item.getType && itemTypes.indexOf(e.item.getType()) === -1) return;
    var item = e.item;
    var graph = this.get('graph');
    this.currentTarget = item;
    this.showTooltip(e);
    graph.emit('tooltipchange', {
      item: e.item,
      action: 'show'
    });
  };

  Tooltip.prototype.onMouseMove = function (e) {
    var shouldBegin = this.get('shouldBegin');
    if (!shouldBegin(e)) return;
    var itemTypes = this.get('itemTypes');
    if (e.item && e.item.getType && itemTypes.indexOf(e.item.getType()) === -1) return;

    if (!this.currentTarget || e.item !== this.currentTarget) {
      return;
    }

    this.updatePosition(e);
  };

  Tooltip.prototype.onMouseLeave = function () {
    this.hideTooltip();
    var graph = this.get('graph');
    graph.emit('tooltipchange', {
      item: this.currentTarget,
      action: 'hide'
    });
    this.currentTarget = null;
  };

  Tooltip.prototype.showTooltip = function (e) {
    var shouldBegin = this.get('shouldBegin');
    if (!shouldBegin(e)) return;

    if (!e.item) {
      return;
    }

    var itemTypes = this.get('itemTypes');
    if (e.item.getType && itemTypes.indexOf(e.item.getType()) === -1) return;
    var container = this.get('tooltip');
    var getContent = this.get('getContent');
    var tooltip = getContent(e);

    if (isString(tooltip)) {
      container.innerHTML = tooltip;
    } else {
      container.innerHTML = tooltip.outerHTML;
    }

    this.updatePosition(e);
  };

  Tooltip.prototype.hideTooltip = function () {
    var tooltip = this.get('tooltip');

    if (tooltip) {
      modifyCSS(tooltip, {
        visibility: 'hidden'
      });
    }
  };

  Tooltip.prototype.updatePosition = function (e) {
    var graph = this.get('graph');
    var width = graph.get('width');
    var height = graph.get('height');
    var tooltip = this.get('tooltip');
    var offsetX = this.get('offsetX') || 0;
    var offsetY = this.get('offsetY') || 0;
    var x = e.canvasX + offsetX;
    var y = e.canvasY + offsetY;
    var bbox = tooltip.getBoundingClientRect();

    if (x + bbox.width > width) {
      x = x - bbox.width - offsetX;
    }

    if (y + bbox.height > height) {
      y = y - bbox.height - offsetY;
    }

    modifyCSS(tooltip, {
      left: x + "px",
      top: y + "px",
      visibility: 'visible'
    });
  };

  Tooltip.prototype.destroy = function () {
    var tooltip = this.get('tooltip');

    if (tooltip) {
      var container = this.get('container');

      if (!container) {
        container = this.get('graph').get('container');
      }

      container.removeChild(tooltip);
    }
  };

  return Tooltip;
}(Base);

export default Tooltip;