window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  Memory: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a1a27K2RVlApJsl9Ag+681r", "Memory");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Memory = function(_super) {
      __extends(Memory, _super);
      function Memory() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.count = 0;
        _this.prefabs = [];
        _this.ins = [];
        return _this;
      }
      Memory.prototype.start = function() {
        this.setCount();
      };
      Memory.prototype.setCount = function() {
        var nodeCount = this.node.getChildByName("count");
        var label = nodeCount.getComponent(cc.Label);
        label.string = "count " + this.count;
      };
      Memory.prototype.update = function(dt) {};
      Memory.prototype.onBtnLoad = function() {
        cc.log("onBtnLoad");
        var self = this;
        for (var i = 0; i < 10; i++) cc.loader.loadRes("memory/bg/" + (i + 1), cc.Prefab, function(err, prefab) {
          cc.log(err, prefab);
          self.prefabs.push(prefab);
          var ins = cc.instantiate(prefab);
          self.ins.push(ins);
          ins.parent = self.node.getChildByName("loaded");
          self.count++;
          self.setCount();
        });
      };
      Memory.prototype.onBtnUnload = function() {
        cc.log("onBtnUnload");
        for (var i = 0; i < 10; i++) {
          var depends = cc.loader.getDependsRecursively("memory/bg/" + (i + 1));
          cc.log(depends);
          for (var index = 0; index < depends.length; index++) {
            var dep = depends[index];
            var res = cc.loader.getRes(dep);
            cc.log(res);
          }
          cc.loader.release(depends);
          this.count--;
          this.setCount();
        }
      };
      Memory.prototype.onBtnSwitchScene = function() {
        cc.director.loadScene("memory2");
      };
      Memory.prototype.onBtnGC = function() {
        cc.sys.garbageCollect();
      };
      Memory = __decorate([ ccclass ], Memory);
      return Memory;
    }(cc.Component);
    exports.default = Memory;
    cc._RF.pop();
  }, {} ],
  Object: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "509d5QAiFBE+5uDyW7DAhR9", "Object");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      NewClass.prototype.start = function() {};
      NewClass.prototype.onLoad = function() {
        cc.log(this.node.uuid, "onLoad");
      };
      NewClass.prototype.onEnable = function() {
        cc.log(this.node.uuid, "onEnable");
      };
      NewClass.prototype.onDisable = function() {
        cc.log(this.node.uuid, "onDisable");
      };
      NewClass.prototype.onDestroy = function() {
        cc.log(this.node.uuid, "destroy");
      };
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  PageViewCtrl: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4d60dpMR9JNVI4kth8w20ZF", "PageViewCtrl");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        curNum: 3,
        curTotal: 10,
        pageTeample: cc.Prefab,
        target: require("PageViewEx"),
        label: cc.Label
      },
      _createPage: function _createPage() {
        var page = cc.instantiate(this.pageTeample);
        page.position = new cc.p(0, 0);
        var color = new cc.Color();
        color.r = Math.floor(255 * Math.random());
        color.g = Math.floor(255 * Math.random());
        color.b = Math.floor(255 * Math.random());
        page.color = color;
        return page;
      },
      onLoad: function onLoad() {
        this.target.setCurrentPageIndex(3);
      },
      onBtnPrev: function onBtnPrev() {
        var prev = this.target.getCurrentPageIndex() - 1;
        prev < 0 && (prev = this.target.getPages().length - 1);
        this.target.setCurrentPageIndex(prev);
      },
      onBtnNext: function onBtnNext() {
        var next = this.target.getCurrentPageIndex() + 1;
        next > this.target.getPages().length - 1 && (next = 0);
        this.target.setCurrentPageIndex(next);
      },
      update: function update() {
        this.label.string = "\u7b2c" + (this.target.getCurrentPageIndex() + 1) + "\u9875";
      },
      onJumpHome: function onJumpHome() {
        this.target.scrollToPage(0);
      },
      plusPage: function plusPage(callback) {
        if (this.curNum > this.curTotal) return;
        this.curNum++;
        callback && callback();
      },
      lessPageNum: function lessPageNum(callback) {
        if (this.curNum <= 0) return;
        this.curNum--;
        callback && callback();
      },
      onAddPage: function onAddPage() {
        var _this = this;
        this.plusPage(function() {
          _this.target.addPage(_this._createPage());
        });
      },
      onInsertPage: function onInsertPage() {
        var _this2 = this;
        this.plusPage(function() {
          _this2.target.insertPage(_this2._createPage(), _this2.target.getCurrentPageIndex());
        });
      },
      onRemovePage: function onRemovePage() {
        var _this3 = this;
        this.lessPageNum(function() {
          var pages = _this3.target.getPages();
          _this3.target.removePage(pages[pages.length - 1]);
        });
      },
      onRemovePageAtIndex: function onRemovePageAtIndex() {
        var _this4 = this;
        this.lessPageNum(function() {
          _this4.target.removePageAtIndex(_this4.target.getCurrentPageIndex());
        });
      },
      onRemoveAllPage: function onRemoveAllPage() {
        this.target.removeAllPages();
        this.curNum = 0;
      },
      onPageEvent: function onPageEvent(sender, eventType) {
        if (eventType !== cc.PageView.EventType.PAGE_TURNING) return;
        console.log("\u5f53\u524d\u6240\u5728\u7684\u9875\u9762\u7d22\u5f15:" + sender.getCurrentPageIndex());
      }
    });
    cc._RF.pop();
  }, {
    PageViewEx: "PageViewEx"
  } ],
  PageViewEx: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c2702XcdZNBJo9ymvl7kw6y", "PageViewEx");
    "use strict";
    var SizeMode = cc.Enum({
      Unified: 0,
      Free: 1
    });
    var Direction = cc.Enum({
      Horizontal: 0,
      Vertical: 1
    });
    var EventType = cc.Enum({
      PAGE_TURNING: 0
    });
    var PageViewEx = cc.Class({
      extends: cc.ScrollView,
      editor: false,
      ctor: function ctor() {
        this._curPageIdx = 0;
        this._lastPageIdx = 0;
        this._pages = [];
        this._curItemIdx;
        this._scrollToIdx;
      },
      properties: {
        sizeMode: {
          default: SizeMode.Unified,
          type: SizeMode,
          tooltip: false,
          notify: function notify() {
            this._syncSizeMode();
          }
        },
        direction: {
          default: Direction.Horizontal,
          type: Direction,
          tooltip: false,
          notify: function notify() {
            this._syncScrollDirection();
          }
        },
        scrollThreshold: {
          default: .5,
          type: cc.Float,
          slide: true,
          range: [ 0, 1, .01 ],
          tooltip: false
        },
        autoPageTurningThreshold: {
          default: 100,
          type: cc.Float,
          tooltip: false
        },
        pageTurningEventTiming: {
          default: .1,
          type: cc.Float,
          range: [ 0, 1, .01 ],
          tooltip: false
        },
        indicator: {
          default: null,
          type: cc.PageViewIndicator,
          tooltip: false,
          notify: function notify() {
            this.indicator && this.indicator.setPageView(this);
          }
        },
        pageTurningSpeed: {
          default: .3,
          type: cc.Float,
          tooltip: false
        },
        pageEvents: {
          default: [],
          type: cc.Component.EventHandler,
          tooltip: false
        },
        transpositionCircle: {
          default: true
        },
        transpositionCount: {
          default: 1,
          type: cc.Integer
        }
      },
      statics: {
        SizeMode: SizeMode,
        Direction: Direction,
        EventType: EventType
      },
      __preload: function __preload() {
        this.node.on("size-changed", this._updateAllPagesSize, this);
      },
      onEnable: function onEnable() {
        this._super();
        true;
        this.node.on("scroll-ended-with-threshold", this._dispatchPageTurningEvent, this);
      },
      onDisable: function onDisable() {
        this._super();
        true;
        this.node.off("scroll-ended-with-threshold", this._dispatchPageTurningEvent, this);
      },
      onLoad: function onLoad() {
        this._monitor = this.content.getComponent("PageViewMonitor");
        if (this._monitor) {
          this._monitor.init(this);
          this.transpositionCircle = this._monitor.transpositionCircle;
          this.transpositionCount = this._monitor.transpositionCount;
        }
        this._initPages();
        this.indicator && this.indicator.setPageView(this);
        this.scrollToPage(0, this.pageTurningSpeed);
      },
      _itemUpdate: function _itemUpdate(dt) {},
      update: function update(dt) {
        this._super(dt);
        var childs = this.content.children;
        childs.every(function(child, index) {
          var itemRect = child.getBoundingBox();
          itemRect.x += this.content.x;
          itemRect.y += this.content.y;
          var focalPoint = null;
          focalPoint = this.direction === Direction.Horizontal ? cc.p(0, itemRect.y + itemRect.height / 2) : cc.p(itemRect.x + itemRect.width / 2, 0);
          this._monitor && this._monitor.itemUpdate(dt, child, index, itemRect, focalPoint);
          if (itemRect.contains(focalPoint) && this._curItemIdx != index) {
            var tmp = this._curItemIdx;
            this._curItemIdx = index;
            this._curItemIdxChanged(tmp, index);
            this._monitor && this._monitor.curItemIdxChanged(tmp, index);
            var originalIndex = this._pages.indexOf(child);
            var tmp = this._curPageIdx;
            this._curPageIdx = originalIndex;
            this._curPageIdxChanged(tmp, originalIndex);
            this._monitor && this._monitor.curPageIdxChanged(tmp, originalIndex);
            this.indicator && this.indicator._changedState();
            return false;
          }
          return true;
        }, this);
      },
      _testDraw: function _testDraw() {
        this.graphics || (this.graphics = this.node.getChildByName("graphics").getComponent(cc.Graphics));
        this.graphics.clear();
        this.graphics.strokeColor = cc.Color.RED;
        this.graphics.moveTo(0, 0);
        this.direction === Direction.Horizontal ? this.graphics.lineTo(0, this.node.height / 2) : this.graphics.lineTo(this.node.width / 2, 0);
        var childs = this.content.children;
        childs.every(function(child, index) {
          var rect = child.getBoundingBox();
          rect.x += this.content.x;
          rect.y += this.content.y;
          var point = null;
          point = this.direction === Direction.Horizontal ? cc.p(0, rect.y + rect.height / 2) : cc.p(rect.x + rect.width / 2, 0);
          rect.contains(point) && this.graphics.rect(rect.x, rect.y, rect.width, rect.height);
          return true;
        }, this);
        this.graphics.stroke();
      },
      _curPageIdxChanged: function _curPageIdxChanged(oldIdx, newIdx) {
        this._curPageIdx == this._scrollToIdx && (this._scrollToIdx = void 0);
      },
      _curItemIdxChanged: function _curItemIdxChanged(oldItemIdx, newItemIdx) {
        if (this.transpositionCircle) {
          var direction = newItemIdx - oldItemIdx;
          var count = this.content.childrenCount;
          count > 1 && (direction < 0 ? this._checkPrevTransposition(oldItemIdx, newItemIdx) : direction > 0 && this._checkNextTransposition(oldItemIdx, newItemIdx));
        }
      },
      _checkInitTransposition: function _checkInitTransposition() {
        this._checkPrevTransposition(this._curPageIdx, this._curPageIdx);
        this._checkNextTransposition(this._curPageIdx, this._curPageIdx);
      },
      _checkPrevTransposition: function _checkPrevTransposition(oldIdx, newIdx) {
        var count = this.content.childrenCount;
        var childs = this.content.children.slice(0);
        var transCount = this.transpositionCount - newIdx;
        if (transCount > 0) {
          var layout = this.content.getComponent(cc.Layout);
          for (var i = 1; i <= transCount; i++) {
            var node = childs[count - i];
            this.content.removeChild(node);
            this.content.insertChild(node, 0);
            this.direction === Direction.Horizontal ? this.content.x -= node.width + layout.spacingX : this.content.y += node.height + layout.spacingY;
          }
          if (this.direction === Direction.Horizontal) {
            var before = cc.p(layout.paddingLeft, layout.paddingTop);
            this._adjustPadding();
            var after = cc.p(layout.paddingLeft, layout.paddingTop);
            this.content.x += before.x - after.x;
          } else {
            var before = cc.p(layout.paddingLeft, layout.paddingTop);
            this._adjustPadding();
            var after = cc.p(layout.paddingLeft, layout.paddingTop);
            this.content.y -= before.y - after.y;
          }
          this._updatePageView();
          if (void 0 !== this._scrollToIdx) {
            this.stopAutoScroll();
            this._scrollToOffsetByPageIndex(this._scrollToIdx, true);
          }
        }
      },
      _checkNextTransposition: function _checkNextTransposition(oldIdx, newIdx) {
        var count = this.content.childrenCount;
        var childs = this.content.children.slice(0);
        var transCount = this.transpositionCount - (count - newIdx - 1);
        if (transCount > 0) {
          var layout = this.content.getComponent(cc.Layout);
          for (var i = 1; i <= transCount; i++) {
            var node = childs[0];
            this.content.removeChild(node);
            this.content.addChild(node);
            this.direction === Direction.Horizontal ? this.content.x += node.width + layout.spacingX : this.content.y -= node.height + layout.spacingY;
          }
          if (this.direction === Direction.Horizontal) {
            var before = cc.p(layout.paddingLeft, layout.paddingTop);
            this._adjustPadding();
            var after = cc.p(layout.paddingLeft, layout.paddingTop);
            this.content.x += before.x - after.x;
          } else {
            var before = cc.p(layout.paddingLeft, layout.paddingTop);
            this._adjustPadding();
            var after = cc.p(layout.paddingLeft, layout.paddingTop);
            this.content.y -= before.y - after.y;
          }
          this._updatePageView();
          if (void 0 !== this._scrollToIdx) {
            this.stopAutoScroll();
            this._scrollToOffsetByPageIndex(this._scrollToIdx, true);
          }
        }
      },
      onDestroy: function onDestroy() {
        this.node.off("size-changed", this._updateAllPagesSize, this);
      },
      getCurrentItemIndex: function getCurrentItemIndex() {
        return this._curItemIdx;
      },
      getCurrentItem: function getCurrentItem() {
        return this.content.children[this._curItemIdx];
      },
      getCurrentPageIndex: function getCurrentPageIndex() {
        return this._curPageIdx;
      },
      setCurrentPageIndex: function setCurrentPageIndex(index) {
        this.scrollToPage(index, true);
      },
      getItems: function getItems() {
        if (this.content) return this.content.children;
        return null;
      },
      getPages: function getPages() {
        return this._pages;
      },
      addPage: function addPage(page) {
        if (!page || -1 !== this._pages.indexOf(page) || !this.content) return;
        this.content.addChild(page);
        this._pages.push(page);
        this._updatePageView();
      },
      insertPage: function insertPage(page, index) {
        if (index < 0 || !page || -1 !== this._pages.indexOf(page) || !this.content) return;
        var pageCount = this._pages.length;
        if (index >= pageCount) this.addPage(page); else {
          this._pages.splice(index, 0, page);
          this.content.addChild(page);
          this._updatePageView();
        }
      },
      removePage: function removePage(page) {
        if (!page || !this.content) return;
        var index = this._pages.indexOf(page);
        if (-1 === index) {
          cc.warnID(4300, page.name);
          return;
        }
        this.removePageAtIndex(index);
      },
      removePageAtIndex: function removePageAtIndex(index) {
        var pageList = this._pages;
        if (index < 0 || index >= pageList.length) return;
        var page = pageList[index];
        if (!page) return;
        this.content.removeChild(page);
        pageList.splice(index, 1);
        this._updatePageView();
      },
      removeAllPages: function removeAllPages() {
        if (!this.content) return;
        var locPages = this._pages;
        for (var i = 0, len = locPages.length; i < len; i++) this.content.removeChild(locPages[i]);
        this._pages.length = 0;
        this._updatePageView();
      },
      scrollToPage: function scrollToPage(idx, timeInSecond) {
        if (idx < 0 || idx >= this._pages.length) return;
        this._curPageIdx != idx && (this._scrollToIdx = idx);
        this._scrollToOffsetByPageIndex(idx, timeInSecond);
      },
      _scrollToOffsetByPageIndex: function _scrollToOffsetByPageIndex(idx, timeInSecond) {
        if (idx < 0 || idx >= this._pages.length) return;
        timeInSecond = void 0 !== timeInSecond ? timeInSecond : .3;
        this.scrollToOffset(this._moveOffsetValue(idx), timeInSecond, true);
        this.indicator && this.indicator._changedState();
      },
      getScrollEndedEventTiming: function getScrollEndedEventTiming() {
        return this.pageTurningEventTiming;
      },
      _syncScrollDirection: function _syncScrollDirection() {
        this.horizontal = this.direction === Direction.Horizontal;
        this.vertical = this.direction === Direction.Vertical;
      },
      _syncSizeMode: function _syncSizeMode() {
        this._adjustPadding();
      },
      _adjustPadding: function _adjustPadding() {
        if (!this.content) return;
        var layout = this.content.getComponent(cc.Layout);
        if (layout) {
          var childs = this.content.children;
          if (0 === childs.length) layout.padding = 0; else {
            var lastPage = childs[childs.length - 1];
            if (this.direction === Direction.Horizontal) {
              layout.paddingLeft = (this.node.width - childs[0].width) / 2;
              layout.paddingRight = (this.node.width - lastPage.width) / 2;
            } else if (this.direction === Direction.Vertical) {
              layout.paddingTop = (this.node.height - childs[0].height) / 2;
              layout.paddingBottom = (this.node.height - lastPage.height) / 2;
            }
          }
          layout.updateLayout();
        }
      },
      _updatePageView: function _updatePageView() {
        var pageCount = this._pages.length;
        if (this._curPageIdx >= pageCount) {
          this._curPageIdx = 0 === pageCount ? 0 : pageCount - 1;
          this._lastPageIdx = this._curPageIdx;
        }
        var layout = this.content.getComponent(cc.Layout);
        if (layout && layout.enabled) {
          layout._layoutDirty = true;
          layout.updateLayout();
        }
        var childs = this.content.children;
        for (var i = 0; i < pageCount; ++i) this.direction === Direction.Horizontal ? childs[i]._scrollCenterOffsetX = Math.abs(this._contentOriginalX + childs[i].x) : childs[i]._scrollCenterOffsetY = Math.abs(this._contentOriginalY + childs[i].y);
        this.indicator && this.indicator._refresh();
      },
      _updateAllPagesSize: function _updateAllPagesSize() {
        if (this.sizeMode !== SizeMode.Unified) return;
        var locPages = this._pages;
        var selfSize = this.node.getContentSize();
        for (var i = 0, len = locPages.length; i < len; i++) locPages[i].setContentSize(selfSize);
      },
      _initPages: function _initPages() {
        if (!this.content) {
          cc.warn("content is null");
          return;
        }
        this._contentOriginalX = this.content.x;
        this._contentOriginalY = this.content.y;
        if (this.transpositionCircle) {
          var count = this.content.childrenCount;
          var maxCount = parseInt((count - 1) / 2);
          this.transpositionCount > maxCount && (this.transpositionCount = maxCount);
          this.transpositionCount < 1 && (this.transpositionCount = 1);
        }
        this._checkPages();
        this._syncScrollDirection();
        this._syncSizeMode();
        this._updatePageView();
        this.transpositionCircle && this._checkInitTransposition();
      },
      _checkPages: function _checkPages() {
        if (!this.content) return;
        this._pages = [];
        var children = this.content.children;
        for (var i = 0; i < children.length; ++i) {
          var page = children[i];
          if (this._pages.indexOf(page) >= 0) continue;
          this._pages.push(page);
        }
      },
      _dispatchPageTurningEvent: function _dispatchPageTurningEvent() {
        if (this._lastPageIdx === this._curPageIdx) return;
        this._lastPageIdx = this._curPageIdx;
        cc.Component.EventHandler.emitEvents(this.pageEvents, this, EventType.PAGE_TURNING);
        this.node.emit("page-turning", this);
        this._monitor && this._monitor.pageTurnEnded(this._curPageIdx);
      },
      _isScrollable: function _isScrollable(offset, index, nextIndex) {
        if (this.sizeMode === SizeMode.Free) {
          var curPageCenter, nextPageCenter;
          if (this.direction === Direction.Horizontal) {
            curPageCenter = this._pages[index]._scrollCenterOffsetX;
            nextPageCenter = this._pages[index]._scrollCenterOffsetX;
            return Math.abs(offset.x) >= Math.abs(curPageCenter - nextPageCenter) * this.scrollThreshold;
          }
          if (this.direction === Direction.Vertical) {
            curPageCenter = this._pages[index]._scrollCenterOffsetY;
            nextPageCenter = this._pages[index]._scrollCenterOffsetY;
            return Math.abs(offset.y) >= Math.abs(curPageCenter - nextPageCenter) * this.scrollThreshold;
          }
        } else {
          if (this.direction === Direction.Horizontal) return Math.abs(offset.x) >= this.node.width * this.scrollThreshold;
          if (this.direction === Direction.Vertical) return Math.abs(offset.y) >= this.node.height * this.scrollThreshold;
        }
      },
      _isQuicklyScrollable: function _isQuicklyScrollable(touchMoveVelocity) {
        if (this._touchEndedTime - this._touchBeganTime >= 200) return false;
        if (this.direction === Direction.Horizontal) {
          if (Math.abs(touchMoveVelocity.x) > this.autoPageTurningThreshold) return true;
        } else if (this.direction === Direction.Vertical && Math.abs(touchMoveVelocity.y) > this.autoPageTurningThreshold) return true;
        return false;
      },
      _moveOffsetValue: function _moveOffsetValue(idx) {
        var offset = cc.p(0, 0);
        this.sizeMode === SizeMode.Free ? this.direction === Direction.Horizontal ? offset.x = this._pages[idx]._scrollCenterOffsetX : this.direction === Direction.Vertical && (offset.y = this._pages[idx]._scrollCenterOffsetY) : this.direction === Direction.Horizontal ? offset.x = idx * this.node.width : this.direction === Direction.Vertical && (offset.y = idx * this.node.height);
        return offset;
      },
      _getDragDirection: function _getDragDirection(moveOffset) {
        if (this.direction === Direction.Horizontal) {
          if (0 === moveOffset.x) return 0;
          return moveOffset.x > 0 ? 1 : -1;
        }
        if (this.direction === Direction.Vertical) {
          if (0 === moveOffset.y) return 0;
          return moveOffset.y < 0 ? 1 : -1;
        }
      },
      _handleMoveLogic: function _handleMoveLogic(touch) {
        this._super(touch);
      },
      _handleReleaseLogic: function _handleReleaseLogic(touch) {
        var bounceBackStarted = this._startBounceBackIfNeeded();
        var moveOffset = cc.pSub(this._touchBeganPosition, this._touchEndPosition);
        if (!this.transpositionCircle && bounceBackStarted) {
          var dragDirection = this._getDragDirection(moveOffset);
          if (0 === dragDirection) return;
          this._curPageIdx = dragDirection > 0 ? this._pages.length - 1 : 0;
          this.indicator && this.indicator._changedState();
        } else {
          var touchMoveVelocity = this._calculateTouchMoveVelocity();
          if (this._isQuicklyScrollable(touchMoveVelocity)) {
            var index = this._curPageIdx, nextIndex = index + this._getDragDirection(moveOffset);
            var timeInSecond = this.pageTurningSpeed;
            this.transpositionCircle ? nextIndex < 0 ? nextIndex = this.content.childrenCount - 1 : nextIndex >= this.content.childrenCount && (nextIndex = 0) : nextIndex < 0 ? nextIndex = 0 : nextIndex >= this.content.childrenCount && (nextIndex = this.content.childrenCount - 1);
            this.scrollToPage(nextIndex, timeInSecond);
            return;
          }
          this.scrollToPage(this._curPageIdx, this.pageTurningSpeed);
        }
      },
      _onTouchBegan: function _onTouchBegan(event, captureListeners) {
        this._touchBeganPosition = event.touch.getLocation();
        this._touchBeganTime = cc.sys.now();
        this._super(event, captureListeners);
      },
      _onTouchMoved: function _onTouchMoved(event, captureListeners) {
        this._touchMovePosition = event.touch.getLocation();
        this._super(event, captureListeners);
      },
      _onTouchEnded: function _onTouchEnded(event, captureListeners) {
        this._touchEndPosition = event.touch.getLocation();
        this._touchEndedTime = cc.sys.now();
        this._super(event, captureListeners);
      },
      _onTouchCancelled: function _onTouchCancelled(event, captureListeners) {
        this._touchEndPosition = event.touch.getLocation();
        this._super(event, captureListeners);
      },
      _onMouseWheel: function _onMouseWheel() {}
    });
    PageViewEx = module.exports = PageViewEx;
    cc._RF.pop();
  }, {} ],
  PageViewMonitor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9607a/kMdFGyJCKktJoj33Y", "PageViewMonitor");
    "use strict";
    var _PageViewEx = require("PageViewEx");
    cc.Class({
      extends: cc.Component,
      properties: {
        transpositionCircle: {
          default: true
        },
        transpositionCount: {
          default: 1,
          type: cc.Integer
        },
        circleScale: false,
        itemAnchor: false,
        itemAnchorX: .5,
        itemAnchorY: .5
      },
      onLoad: function onLoad() {},
      init: function init(pageView) {
        this._pageView = pageView;
      },
      itemUpdate: function itemUpdate(dt, itemNode, itemIndex, itemRect, focalPoint) {
        if (this.circleScale) if (this._pageView.direction == _PageViewEx.Direction.Horizontal) {
          var scale = 1 - Math.min(.002 * Math.abs(itemRect.center.x - focalPoint.x), .8);
          itemNode.scale = scale;
          if (this.itemAnchor) {
            itemNode.anchorX = this.itemAnchorX;
            itemNode.anchorY = this.itemAnchorY;
          }
        } else {
          var scale = 1 - Math.min(.002 * Math.abs(itemRect.center.y - focalPoint.y), .8);
          itemNode.scale = scale;
          if (this.itemAnchor) {
            itemNode.anchorX = this.itemAnchorX;
            itemNode.anchorY = this.itemAnchorY;
          }
        }
      },
      curPageIdxChanged: function curPageIdxChanged(oldIdx, newIdx) {},
      curItemIdxChanged: function curItemIdxChanged(oldItemIdx, newItemIdx) {},
      pageTurnEnded: function pageTurnEnded(curPageIndex) {}
    });
    cc._RF.pop();
  }, {
    PageViewEx: "PageViewEx"
  } ],
  RoleView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3a21bU0ycVIpLTJ2hGF2Bre", "RoleView");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var RoleView = function(_super) {
      __extends(RoleView, _super);
      function RoleView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.role = [];
        return _this;
      }
      RoleView.prototype.playerAction = function(actionName) {
        for (var index = 0; index < this.role.length; index++) {
          var element = this.role[index];
          element.setAnimation(0, actionName, true);
        }
      };
      RoleView.prototype.pausedAction = function(paused) {
        for (var index = 0; index < this.role.length; index++) {
          var element = this.role[index];
          element.paused = paused;
        }
      };
      __decorate([ property(sp.Skeleton) ], RoleView.prototype, "role", void 0);
      RoleView = __decorate([ ccclass ], RoleView);
      return RoleView;
    }(cc.Component);
    exports.default = RoleView;
    cc._RF.pop();
  }, {} ],
  TestSpineScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8b6c6lMGNhMzozUJ8CZOkVi", "TestSpineScene");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var RoleView_1 = require("./RoleView");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var TestSpineScene = function(_super) {
      __extends(TestSpineScene, _super);
      function TestSpineScene() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.roleLayer = null;
        _this.roleNodeNew = [];
        _this.roleNodeOld = [];
        _this.lab = null;
        _this._ms = 0;
        _this._fps = 0;
        _this._role = [];
        _this._actionName = "idle";
        _this._pausedAction = false;
        return _this;
      }
      TestSpineScene.prototype.onLoad = function() {
        this.lab.string = "0";
      };
      TestSpineScene.prototype.update = function(dt) {
        this._ms += 1e3 * dt;
        this._fps++;
        if (this._ms >= 1e3) {
          this.lab.string = "\u6570\u91cf:" + this._role.length + "  fps:" + this._fps + "  fps_frame:" + (1 / dt).toFixed(2);
          this._ms = 0;
          this._fps = 0;
        }
      };
      TestSpineScene.prototype.clickButton = function(event, customEventData) {
        switch (customEventData) {
         case "new":
          this.addRole(this.roleNodeNew);
          break;

         case "old":
          this.addRole(this.roleNodeOld);
        }
      };
      TestSpineScene.prototype.clearButton = function() {
        this.roleLayer.removeAllChildren();
        this._role = [];
        this.lab.string = this._role.length.toString();
      };
      TestSpineScene.prototype.setActionButton = function(event, customEventData) {
        this._actionName = customEventData;
        for (var index = 0; index < this._role.length; index++) {
          var element = this._role[index];
          element.playerAction(this._actionName);
        }
      };
      TestSpineScene.prototype.pausedAction = function() {
        this._pausedAction = !this._pausedAction;
        for (var index = 0; index < this._role.length; index++) {
          var element = this._role[index];
          element.pausedAction(this._pausedAction);
        }
      };
      TestSpineScene.prototype.addRole = function(roleNodes) {
                   var index = 5;
        //for (var index = 0; index < roleNodes.length; index++) {
          var element = roleNodes[index];
          var node = cc.instantiate(element);
          var roleView = node.getComponent(RoleView_1.default);
          if (roleView) {
            roleView.playerAction(this._actionName);
            roleView.pausedAction(this._pausedAction);
            this._role.push(roleView);
          } else cc.log("1111111111");
          node.position = new cc.Vec2();
          this.roleLayer.addChild(node);
        //}
      };
      __decorate([ property(cc.Node) ], TestSpineScene.prototype, "roleLayer", void 0);
      __decorate([ property(cc.Node) ], TestSpineScene.prototype, "roleNodeNew", void 0);
      __decorate([ property(cc.Node) ], TestSpineScene.prototype, "roleNodeOld", void 0);
      __decorate([ property(cc.Label) ], TestSpineScene.prototype, "lab", void 0);
      TestSpineScene = __decorate([ ccclass ], TestSpineScene);
      return TestSpineScene;
    }(cc.Component);
    exports.default = TestSpineScene;
    cc._RF.pop();
  }, {
    "./RoleView": "RoleView"
  } ],
  Test_2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "45fd62CHkBM+r+xIyTkll+1", "Test_2");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.objs = [];
        _this.nodeTest = null;
        _this.nodeTest1 = null;
        _this.nodeTest2 = null;
        return _this;
      }
      NewClass.prototype.start = function() {
        this.nodeTest = this.node.getChildByName("btnTest");
        this.nodeTest1 = this.nodeTest.getChildByName("btnTest1");
        this.nodeTest2 = this.nodeTest.getChildByName("btnTest2");
        this.nodeTest.on("touchstart", function(event) {
          cc.log("11111", event);
        }, this);
        this.nodeTest1.on("touchstart", function() {
          cc.log("22222");
        }, this);
        this.nodeTest2.on("touchstart", function() {
          cc.log("33333", event);
        }, this);
      };
      NewClass.prototype.onBtnHide = function(event) {};
      NewClass.prototype.onBtnShow = function() {
        var node = this.node.getChildByName("1");
        this.objs.forEach(function(child) {
          child.active = true;
        }, this);
        this.objs = [];
      };
      NewClass.prototype.onBtnTest = function() {
        cc.log("onBtnTest");
      };
      NewClass.prototype.onBtnTest1 = function() {
        cc.log("onBtnTest1");
      };
      NewClass.prototype.onBtnTest2 = function() {
        cc.log("onBtnTest2");
      };
      NewClass.prototype.onBtnCanvas = function() {
        cc.log("onBtnCanvas");
      };
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ]
}, {}, [ "PageViewCtrl", "PageViewEx", "PageViewMonitor", "Memory", "Object", "RoleView", "TestSpineScene", "Test_2" ]);
//# sourceMappingURL=project.dev.js.map
