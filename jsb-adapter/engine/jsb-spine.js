/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

jsbSkeleton = sp.Skeleton;

jsbSkeleton.prototype.setSkeletonData = function (skeletonData) {
    if (skeletonData.width != null && skeletonData.height != null) {
        this.node.setContentSize(skeletonData.width, skeletonData.height);
    }

    var uuid = skeletonData._uuid;
    if ( !uuid ) {
        cc.errorID(7504);
        return;
    }
    var jsonFile = cc.loader.md5Pipe ? cc.loader.md5Pipe.transformURL(skeletonData.nativeUrl, true) : skeletonData.nativeUrl;
    var atlasText = skeletonData.atlasText;
    if (!atlasText) {
        cc.errorID(7508, skeletonData.name);
        return;
    }
    var texValues = skeletonData.textures;
    var texKeys = skeletonData.textureNames;
    if ( !(texValues && texValues.length > 0 && texKeys && texKeys.length > 0) ) {
        cc.errorID(7507, skeletonData.name);
        return;
    }
    var textures = {};
    for (var i = 0; i < texValues.length; ++i) {
        textures[texKeys[i]] = texValues[i];
    }

    var skeletonAni = new sp.SkeletonAnimation();
    try {
        sp._initSkeletonRenderer(skeletonAni, jsonFile, atlasText, textures, skeletonData.scale);
    }
    catch (e) {
        cc._throw(e);
        return;
    }
    this._skeleton = skeletonAni;
}

jsbSkeleton.prototype.setAnimationStateData = function (stateData) {
    this._skeleton.setAnimationStateData(stateData);
}

jsbSkeleton.prototype.update = function (dt) {
    if (this._skeleton) {
        this._skeleton.update(dt*this.timeScale);
    }
}

jsbSkeleton.prototype.setSkin = function (skinName) {
    if (this._skeleton) {
        return this._skeleton.setSkin(skinName);
    }
    return null;
}

jsbSkeleton.prototype.getAttachment = function (slotName, attachmentName) {
    if (this._skeleton) {
        return this._skeleton.getAttachment(slotName, attachmentName);
    }
    return null;
}

jsbSkeleton.prototype.setMix = function (fromAnimation, toAnimation, duration) {
    if (this._skeleton) {
        this._skeleton.setMix(fromAnimation, toAnimation, duration);
    }
}

jsbSkeleton.prototype.setAnimation = function (trackIndex, name, loop) {
    if (this._skeleton) {
        var res = this._skeleton.setAnimation(trackIndex, name, loop);
        return res;
    }
    return null;
}

jsbSkeleton.prototype.addAnimation = function (trackIndex, name, loop, delay) {
    if (this._skeleton) {
        return this._skeleton.addAnimation(trackIndex, name, loop, delay || 0);
    }
    return null;
}

jsbSkeleton.prototype.findAnimation = function (name) {
    if (this._skeleton) {
        return this._skeleton.findAnimation(name);
    }
    return null;
}

jsbSkeleton.prototype.getCurrent = function (trackIndex) {
    if (this._skeleton) {
        return this._skeleton.getCurrent(trackIndex);
    }
    return null;
}

jsbSkeleton.prototype.clearTracks = function () {
    if (this._skeleton) {
        this._skeleton.clearTracks();
    }
}

jsbSkeleton.prototype.clearTrack = function (trackIndex) {
    if (this._skeleton) {
        this._skeleton.clearTrack(trackIndex);
    }
}

jsbSkeleton.prototype.setStartListener = function (listener) {
    this._startListener = listener;
    if (this._skeleton) {
        this._skeleton.setStartListener(listener);
    }
}

jsbSkeleton.prototype.setInterruptListener = function (listener) {
    this._interruptListener = listener;
    if (this._skeleton) {
        this._skeleton.setInterruptListener(listener);
    }
}

jsbSkeleton.prototype.setEndListener = function (listener) {
    this._endListener = listener;
    if (this._skeleton) {
        this._skeleton.setEndListener(listener);
    }
}

jsbSkeleton.prototype.setDisposeListener = function (listener) {
    this._disposeListener = listener;
    if (this._skeleton) {
        this._skeleton.setDisposeListener(listener);
    }
}

jsbSkeleton.prototype.setCompleteListener = function (listener) {
    this._completeListener = listener;
    if (this._skeleton) {
        this._skeleton.setCompleteListener(listener);
    }
}

jsbSkeleton.prototype.setEventListener = function (listener) {
    this._eventListener = listener;
    if (this._skeleton) {
        this._skeleton.setEventListener(listener);
    }
}

jsbSkeleton.prototype.setTrackStartListener = function (entry, listener) {
    if (this._skeleton) {
        this._skeleton.setTrackStartListener(entry, listener);
    }
},

/**
 * !#en Set the start event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画开始播放的事件监听。
 * @method setTrackStartListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 */
setTrackStartListener (entry, listener) {
    TrackEntryListeners.getListeners(entry).start = listener;
},

/**
 * !#en Set the interrupt event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画被打断的事件监听。
 * @method setTrackInterruptListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 */
setTrackInterruptListener (entry, listener) {
    TrackEntryListeners.getListeners(entry).interrupt = listener;
},

/**
 * !#en Set the end event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画播放结束的事件监听。
 * @method setTrackEndListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 */
setTrackEndListener (entry, listener) {
    TrackEntryListeners.getListeners(entry).end = listener;
},

/**
 * !#en Set the dispose event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画即将被销毁的事件监听。
 * @method setTrackDisposeListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 */
setTrackDisposeListener(entry, listener){
    TrackEntryListeners.getListeners(entry).dispose = listener;
},

/**
 * !#en Set the complete event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画一次循环播放结束的事件监听。
 * @method setTrackCompleteListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 * @param {sp.spine.TrackEntry} listener.entry
 * @param {Number} listener.loopCount
 */
setTrackCompleteListener (entry, listener) {
    TrackEntryListeners.getListeners(entry).complete = function (trackEntry) {
        var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd); 
        listener(trackEntry, loopCount);
    };
},

/**
 * !#en Set the event listener for specified TrackEntry.
 * !#zh 用来为指定的 TrackEntry 设置动画帧事件的监听。
 * @method setTrackEventListener
 * @param {sp.spine.TrackEntry} entry
 * @param {function} listener
 */
setTrackEventListener (entry, listener) {
    TrackEntryListeners.getListeners(entry).event = listener;
},

/**
 * !#en Get the animation state object
 * !#zh 获取
 * @method setTrackEventListener
 * @return {sp.spine.AnimationState} state
 */
getState () {
    return this._state;
},

// update animation list for editor
_updateAnimEnum: CC_EDITOR && function () {
    var animEnum;
    if (this.skeletonData) {
        animEnum = this.skeletonData.getAnimsEnum();
    }
    // change enum
    setEnumAttr(this, '_animationIndex', animEnum || DefaultAnimsEnum);
},
// update skin list for editor
_updateSkinEnum: CC_EDITOR && function () {
    var skinEnum;
    if (this.skeletonData) {
        skinEnum = this.skeletonData.getSkinsEnum();
    }
    // change enum
    setEnumAttr(this, '_defaultSkinIndex', skinEnum || DefaultSkinsEnum);
},

_ensureListener () {
    if (!this._listener) {
        this._listener = new TrackEntryListeners();
        if (this._state) {
            this._state.addListener(this._listener);
        }
    }
},

_updateSkeletonData () {
    if (this.skeletonData/* && this.atlasFile*/) {
        let data = this.skeletonData.getRuntimeData();
        if (data) {
            try {
                this.setSkeletonData(data);
                this.setAnimationStateData(new spine.AnimationStateData(this._skeleton.data));
                if (this.defaultSkin) {
                    this._skeleton.setSkinByName(this.defaultSkin);
                }
            }
            catch (e) {
                cc.warn(e);
            }
            this.animation = this.defaultAnimation;
        }
    }
},

_refreshInspector () {
    // update inspector
    this._updateAnimEnum();
    this._updateSkinEnum();
    Editor.Utils.refreshSelectedInspector('node', this.node.uuid);
},

_initDebugDraw: function () {
    if (this.debugBones || this.debugSlots) {
        if (!this._debugRenderer) {
            let debugDrawNode = new cc.PrivateNode();
            debugDrawNode.name = 'DEBUG_DRAW_NODE';
            let debugDraw = debugDrawNode.addComponent(Graphics);
            debugDraw.lineWidth = 1;
            debugDraw.strokeColor = cc.color(255, 0, 0, 255);
            
            this._debugRenderer = debugDraw;
        }

        this._debugRenderer.node.parent = this.node;
    }
    else if (this._debugRenderer) {
        this._debugRenderer.node.parent = null;
    }
}