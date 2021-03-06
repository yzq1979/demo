import { __assign, __extends, __rest } from "tslib";
import modifyCSS from '@antv/dom-util/lib/modify-css';
import createDOM from '@antv/dom-util/lib/create-dom';
import { Canvas } from '@antv/g-canvas';
import { Slider } from '@antv/component';
import Base from '../base';
;

var TimeBar =
/** @class */
function (_super) {
  __extends(TimeBar, _super);

  function TimeBar(cfg) {
    return _super.call(this, cfg) || this;
  }

  TimeBar.prototype.getDefaultCfgs = function () {
    return {
      width: 400,
      height: 50,
      rangeChange: null,
      timebar: {
        x: 10,
        y: 10,
        width: 380,
        height: 26,
        minLimit: 0,
        maxLimit: 1,
        start: 0.1,
        end: 0.9
      }
    };
  };

  TimeBar.prototype.init = function () {
    var timeBarConfig = this.get('timebar');
    var _a = timeBarConfig.trend,
        trend = _a === void 0 ? {} : _a;
    var _b = trend.data,
        data = _b === void 0 ? [] : _b;

    if (!data || data.length === 0) {
      console.warn('TimeBar 中没有传入数据');
      return;
    }

    var container = this.get('container');
    var graphContainer = this.get('graph').get('container');
    var timebar;

    if (!container) {
      timebar = createDOM("<div class='g6-component-timebar'></div>");
      modifyCSS(timebar, {
        position: 'absolute'
      });
    } else {
      timebar = container;
    }

    graphContainer.appendChild(timebar);
    this.set('timeBarContainer', timebar);
    this.initTimeBar(timebar);
  };

  TimeBar.prototype.initTimeBar = function (container) {
    var width = this.get('width');
    var height = this.get('height');
    var canvas = new Canvas({
      container: container,
      width: width,
      height: height
    });
    var group = canvas.addGroup({
      id: 'timebar-plugin'
    });
    var timeBarConfig = this.get('timebar');

    var _a = timeBarConfig.trend,
        trend = _a === void 0 ? {} : _a,
        option = __rest(timeBarConfig, ["trend"]);

    var config = __assign({
      container: group,
      minText: option.start,
      maxText: option.end
    }, option); // 是否显示 TimeBar 根据是否传入了数据来确定


    var _b = trend.data,
        data = _b === void 0 ? [] : _b,
        trendOption = __rest(trend, ["data"]);

    var trendData = data.map(function (d) {
      return d.value;
    });
    config['trendCfg'] = __assign(__assign({}, trendOption), {
      data: trendData
    });
    var min = Math.round(data.length * option.start);
    var max = Math.round(data.length * option.end);
    max = max >= data.length ? data.length - 1 : max;
    config.minText = data[min].date;
    config.maxText = data[max].date;
    this.set('trendData', data);
    var slider = new Slider(config);
    slider.init();
    slider.render();
    this.set('slider', slider);
    this.bindEvent();
  };
  /**
   * 当滑动时，最小值和最大值会变化，变化以后触发相应事件
   */


  TimeBar.prototype.bindEvent = function () {
    var _this = this;

    var slider = this.get('slider');

    var _a = this.get('timebar'),
        start = _a.start,
        end = _a.end;

    var graph = this.get('graph');
    graph.on('afterrender', function (e) {
      _this.filterData({
        value: [start, end]
      });
    });
    slider.on('valuechanged', function (evt) {
      _this.filterData(evt);
    });
  };

  TimeBar.prototype.filterData = function (evt) {
    var value = evt.value;
    var trendData = this.get('trendData');
    var rangeChange = this.get('rangeChange');
    var graph = this.get('graph');
    var slider = this.get('slider');
    var min = Math.round(trendData.length * value[0]);
    var max = Math.round(trendData.length * value[1]);
    max = max >= trendData.length ? trendData.length - 1 : max;
    var minText = trendData[min].date;
    var maxText = trendData[max].date;
    slider.set('minText', minText);
    slider.set('maxText', maxText);

    if (rangeChange) {
      rangeChange(graph, minText, maxText);
    } else {
      // 自动过滤数据，并渲染 graph
      var graphData = graph.save();

      if (!this.cacheGraphData || this.cacheGraphData.nodes && this.cacheGraphData.nodes.length === 0) {
        this.cacheGraphData = graphData;
      } // 过滤不在 min 和 max 范围内的节点


      var filterData = this.cacheGraphData.nodes.filter(function (d) {
        return d.date >= minText && d.date <= maxText;
      });
      var nodeIds_1 = filterData.map(function (node) {
        return node.id;
      }); // 过滤 source 或 target 不在 min 和 max 范围内的边

      var fileterEdges = this.cacheGraphData.edges.filter(function (edge) {
        return nodeIds_1.includes(edge.source) && nodeIds_1.includes(edge.target);
      });
      graph.changeData({
        nodes: filterData,
        edges: fileterEdges
      });
    }
  };

  TimeBar.prototype.show = function () {
    var slider = this.get('slider');
    slider.show();
  };

  TimeBar.prototype.hide = function () {
    var slider = this.get('slider');
    slider.hide();
  };

  TimeBar.prototype.destroy = function () {
    this.cacheGraphData = null;
    var slider = this.get('slider');

    if (slider) {
      slider.off('valuechanged');
      slider.destroy();
    }

    var timeBarContainer = this.get('timeBarContainer');

    if (timeBarContainer) {
      var container = this.get('container');

      if (!container) {
        container = this.get('graph').get('container');
      }

      container.removeChild(timeBarContainer);
    }
  };

  return TimeBar;
}(Base);

export default TimeBar;