import { __extends } from "tslib";
import modifyCSS from '@antv/dom-util/lib/modify-css';
import createDOM from '@antv/dom-util/lib/create-dom';
import isString from '@antv/util/lib/is-string';
import insertCss from 'insert-css';
import Base from '../base';
insertCss("\n  .g6-component-contextmenu {\n    border: 1px solid #e2e2e2;\n    border-radius: 4px;\n    font-size: 12px;\n    color: #545454;\n    background-color: rgba(255, 255, 255, 0.9);\n    padding: 10px 8px;\n    box-shadow: rgb(174, 174, 174) 0px 0px 10px;\n  }\n  .g6-contextmenu-ul {\n    padding: 0;\n    margin: 0;\n    list-style: none;\n  }\n\n");

var Menu =
/** @class */
function (_super) {
  __extends(Menu, _super);

  function Menu(cfg) {
    return _super.call(this, cfg) || this;
  }

  Menu.prototype.getDefaultCfgs = function () {
    return {
      offsetX: 6,
      offsetY: 6,
      handleMenuClick: undefined,
      // 指定菜单内容，function(e) {...}
      getContent: function getContent(graph) {
        return "\n          <ul class='g6-contextmenu-ul'>\n            <li>\u83DC\u5355\u98791</li>\n            <li>\u83DC\u5355\u98792</li>\n          </ul>\n        ";
      },
      shouldBegin: function shouldBegin(e) {
        return true;
      },
      // 菜单隐藏事件
      onHide: function onHide() {
        return true;
      },
      itemTypes: ['node', 'edge', 'combo']
    };
  }; // class-methods-use-this


  Menu.prototype.getEvents = function () {
    return {
      contextmenu: 'onMenuShow'
    };
  };

  Menu.prototype.init = function () {
    var className = this.get('className');
    var menu = createDOM("<div class=" + (className || 'g6-component-contextmenu') + "></div>");
    modifyCSS(menu, {
      position: 'absolute',
      visibility: 'hidden'
    });
    var container = this.get('container');

    if (!container) {
      container = this.get('graph').get('container');
    }

    container.appendChild(menu);
    this.set('menu', menu);
  };

  Menu.prototype.onMenuShow = function (e) {
    var self = this;
    e.preventDefault();
    e.stopPropagation();
    if (!e.item) return;
    var shouldBegin = this.get('shouldBegin');
    if (!shouldBegin(e)) return;
    var itemTypes = this.get('itemTypes');

    if (e.item && e.item.getType && itemTypes.indexOf(e.item.getType()) === -1) {
      self.onMenuHide();
      return;
    }

    if (!e.item) {
      return;
    }

    var menuDom = this.get('menu');
    var getContent = this.get('getContent');
    var menu = getContent(e);

    if (isString(menu)) {
      menuDom.innerHTML = menu;
    } else {
      menuDom.innerHTML = menu.outerHTML;
    }

    var handleMenuClick = this.get('handleMenuClick');

    if (handleMenuClick) {
      var handleMenuClickWrapper = function handleMenuClickWrapper(evt) {
        handleMenuClick(evt.target, e.item);
      };

      this.set('handleMenuClickWrapper', handleMenuClickWrapper);
      menuDom.addEventListener('click', handleMenuClickWrapper);
    }

    var graph = this.get('graph');
    var width = graph.get('width');
    var height = graph.get('height');
    var bbox = menuDom.getBoundingClientRect();
    var offsetX = this.get('offsetX') || 0;
    var offsetY = this.get('offsetY') || 0;
    var x = e.canvasX + offsetX;
    var y = e.canvasY + offsetY;

    if (x + bbox.width > width) {
      x = x - bbox.width - offsetX;
    }

    if (y + bbox.height > height) {
      y = y - bbox.height - offsetY;
    }

    modifyCSS(menuDom, {
      top: y + "px",
      left: x + "px",
      visibility: 'visible'
    });

    var handler = function handler(evt) {
      self.onMenuHide();
    }; // 如果在页面中其他任意地方进行click, 隐去菜单


    document.body.addEventListener('click', handler);
    this.set('handler', handler);
  };

  Menu.prototype.onMenuHide = function () {
    var menuDom = this.get('menu');

    if (menuDom) {
      modifyCSS(menuDom, {
        visibility: 'hidden'
      });
    } // 隐藏菜单后需要移除事件监听


    document.body.removeEventListener('click', this.get('handler'));
    var handleMenuClickWrapper = this.get('handleMenuClickWrapper');

    if (handleMenuClickWrapper) {
      menuDom.removeEventListener('click', handleMenuClickWrapper);
    }
  };

  Menu.prototype.destroy = function () {
    var menu = this.get('menu');
    var handler = this.get('handler');
    var handleMenuClickWrapper = this.get('handleMenuClickWrapper');

    if (handleMenuClickWrapper) {
      menu.removeEventListener('click', handleMenuClickWrapper);
    }

    if (menu) {
      var container = this.get('container');

      if (!container) {
        container = this.get('graph').get('container');
      }

      container.removeChild(menu);
    }

    if (handler) {
      document.body.removeEventListener('click', handler);
    }
  };

  return Menu;
}(Base);

export default Menu;