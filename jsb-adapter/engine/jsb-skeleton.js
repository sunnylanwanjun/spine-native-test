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

var jsbSkeleton = sp.Skeleton.prototype;
jsbSkeleton.setSkeletonData = function (skeletonData) {
    null != skeletonData.width && null != skeletonData.height && this.node.setContentSize(skeletonData.width, skeletonData.height);

    // jsb
    var uuid = skeletonData._uuid;
    if (!uuid) {
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
    if (!(texValues && texValues.length > 0 && texKeys && texKeys.length > 0)) {
        cc.errorID(7507, skeletonData.name);
        return;
    }
    var textures = {};
    for (var i = 0; i < texValues.length; ++i) {
        var spTex = new jsbspine.Texture2D();
        spTex.setRealTextureIndex(i);
        spTex.setPixelsWide(texValues[i].width);
        spTex.setPixelsHigh(texValues[i].height);
        spTex.setTexParamCallback(function(texIdx,minFilter,magFilter,wrapS,warpT){
            texValues[texIdx].setFilters(minFilter, magFilter);
            texValues[texIdx].setWrapMode(wrapS, warpT);
        }.bind(this));
        textures[texKeys[i]] = spTex;
    }

    var skeletonAni = new jsbspine.SkeletonAnimation();
    try {
        jsbspine._initSkeletonRenderer(skeletonAni, jsonFile, atlasText, textures, skeletonData.scale);
    } catch (e) {
        cc._throw(e);
        return;
    }
    this._skeleton = skeletonAni;
    this._skeletonTextures = textures;

    // jsb init skeleton listener
    // using the recorded event listeners
    this._startListener && this.setStartListener(this._startListener);
    this._endListener && this.setEndListener(this._endListener);
    this._completeListener && this.setCompleteListener(this._completeListener);
    this._eventListener && this.setEventListener(this._eventListener);
    this._interruptListener && this.setInterruptListener(this._interruptListener);
    this._disposeListener && this.setDisposeListener(this._disposeListener);

    // h5
    // this._skeleton = new spine.Skeleton(skeletonData);
    // this._rootBone = this._skeleton.getRootBone(); 
}

jsbSkeleton.setAnimationStateData = function (stateData) {
    //jsb
    if(this._skeleton){
        return this._skeleton.setAnimationStateData(stateData);
    }

    // h5 init skeleton listener
    // var state = new spine.AnimationState(stateData);
    // if (this._listener) {
    //     this._state && this._state.removeListener(this._listener);
    //     state.addListener(this._listener);
    // }
    // this._state = state;
}

jsbSkeleton.update = function (dt) {
    var skeleton = this._skeleton;
    // h5
    // var state = this._state;
    if (skeleton) {
        skeleton.update(dt);
        // h5
        // if (state) {
        //     dt *= this.timeScale;
        //     state.update(dt);
        //     state.apply(skeleton);
        // }
    }
}

jsbSkeleton.updateWorldTransform = function () {
    this._skeleton && this._skeleton.updateWorldTransform();
}

jsbSkeleton.setToSetupPose = function () {
    this._skeleton && this._skeleton.setToSetupPose();
}

jsbSkeleton.setBonesToSetupPose = function () {
    this._skeleton && this._skeleton.setBonesToSetupPose();
}

jsbSkeleton.setSlotsToSetupPose = function () {
    this._skeleton && this._skeleton.setSlotsToSetupPose();
}

jsbSkeleton.findBone = function (boneName) {
    if (this._skeleton) return this._skeleton.findBone(boneName);
    return null;
}

jsbSkeleton.findSlot = function (slotName) {
    if (this._skeleton) return this._skeleton.findSlot(slotName);
    return null;
}

jsbSkeleton.setSkin = function (skinName) {
    if (this._skeleton) return this._skeleton.setSkin(skinName);
    return null;
}

jsbSkeleton.getAttachment = function (slotName, attachmentName) {
    if (this._skeleton) return this._skeleton.getAttachment(slotName, attachmentName);
    return null;
}

jsbSkeleton.setAttachment = function (slotName, attachmentName) {
    this._skeleton && this._skeleton.setAttachment(slotName, attachmentName);
}

jsbSkeleton.getTextureAtlas = function (regionAttachment) {
    // jsb
    cc.warn("sp.Skeleton getTextureAtlas not support in native");
    return null;
    // h5
    //return regionAttachment.region;
}

jsbSkeleton.setMix = function (fromAnimation, toAnimation, duration) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setMix(fromAnimation, toAnimation, duration);
    }
    // h5
    // this._state && this._state.data.setMix(fromAnimation, toAnimation, duration);
}

jsbSkeleton.setAnimation = function (trackIndex, name, loop) {
    if (this._skeleton) {
        // jsb
        return this._skeleton.setAnimation(trackIndex, name, loop);
        // h5
        // var animation = this._skeleton.data.findAnimation(name);
        // if (!animation) {
        //     cc.logID(7509, name);
        //     return null;
        // }
        // var res = this._state.setAnimationWith(trackIndex, animation, loop);
        // return res;
    }
    return null;
}

jsbSkeleton.addAnimation = function (trackIndex, name, loop, delay) {
    if (this._skeleton) {
        delay = delay || 0;
        // jsb
        return this._skeleton.addAnimation(trackIndex, name, loop, delay);

        // h5
        // var animation = this._skeleton.data.findAnimation(name);
        // if (!animation) {
        //     cc.logID(7510, name);
        //     return null;
        // }
        // return this._state.addAnimationWith(trackIndex, animation, loop, delay);
    }
    return null;
}

jsbSkeleton.findAnimation = function (name) {
    // jsb
    if (this._skeleton) return this._skeleton.findAnimation(name);
    // h5
    // if (this._skeleton) return this._skeleton.data.findAnimation(name);
    return null;
}

jsbSkeleton.getCurrent = function (trackIndex) {
    // jsb
    if (this._skeleton) {
        return this._skeleton.getCurrent(trackIndex);
    }
    // h5
    // if (this._state) return this._state.getCurrent(trackIndex);
    return null;
}

jsbSkeleton.clearTracks = function () {
    // jsb
    if (this._skeleton) {
        this._skeleton.clearTracks();
    }
    // h5
    // this._state && this._state.clearTracks();
}

jsbSkeleton.clearTrack = function (trackIndex) {
    // jsb
    if (this._skeleton) {
        this._skeleton.clearTrack(trackIndex);
    }
    // h5
    // if (this._state) {
    //     this._state.clearTrack(trackIndex);
    // }
}

jsbSkeleton.setStartListener = function (listener) {
    // jsb
    this._startListener = listener;
    if (this._skeleton) {
        this._skeleton.setStartListener(listener);
    }
    // h5
    // this._ensureListener();
    // this._listener.start = listener;
}

jsbSkeleton.setInterruptListener = function (listener) {
    // jsb
    this._interruptListener = listener;
    if (this._skeleton) {
        this._skeleton.setInterruptListener(listener);
    }
    
    // h5
    // this._ensureListener();
    // this._listener.interrupt = listener;
}

jsbSkeleton.setEndListener = function (listener) {
    // jsb
    this._endListener = listener;
    if (this._skeleton) {
        this._skeleton.setEndListener(listener);
    }

    // h5
    // this._ensureListener();
    // this._listener.end = listener;
}

jsbSkeleton.setDisposeListener = function (listener) {
    // jsb
    this._disposeListener = listener;
    if (this._skeleton) {
        this._skeleton.setDisposeListener(listener);
    }

    // h5
    // this._ensureListener();
    // this._listener.dispose = listener;
}

jsbSkeleton.setCompleteListener = function (listener) {
    // jsb
    this._completeListener = listener;
    if (this._skeleton) {
        this._skeleton.setCompleteListener(listener);
    }

    // h5
    // this._ensureListener();
    // this._listener.complete = listener;
}

jsbSkeleton.setEventListener = function (listener) {
    // jsb
    this._eventListener = listener;
    if (this._skeleton) {
        this._skeleton.setEventListener(listener);
    }

    // h5
    // this._ensureListener();
    // this._listener.event = listener;
}

jsbSkeleton.setTrackStartListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackStartListener(entry, listener);
    }
    // h5
    // TrackEntryListeners.getListeners(entry).start = listener;
}

jsbSkeleton.setTrackInterruptListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackInterruptListener(entry, listener);
    }

    // h5
    // TrackEntryListeners.getListeners(entry).interrupt = listener;
}

jsbSkeleton.setTrackEndListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackEndListener(entry, listener);
    }

    // h5
    // TrackEntryListeners.getListeners(entry).end = listener;
}

jsbSkeleton.setTrackDisposeListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackDisposeListener(entry, listener);
    }

    // h5
    // TrackEntryListeners.getListeners(entry).dispose = listener;
}

jsbSkeleton.setTrackCompleteListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackCompleteListener(entry, listener);
    }

    // h5
    // TrackEntryListeners.getListeners(entry).complete = function (trackEntry) {
    //     var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
    //     listener(trackEntry, loopCount);
    // };
}

jsbSkeleton.setTrackEventListener = function (entry, listener) {
    // jsb
    if (this._skeleton) {
        this._skeleton.setTrackEventListener(entry, listener);
    }

    // h5
    // TrackEntryListeners.getListeners(entry).event = listener;
}

jsbSkeleton.getState = function () {
    // jsb
    if (this._skeleton) {
        return this._skeleton.getState();
    }

    // h5
    // return this._state;
}

jsbSkeleton._ensureListener = function () {
    cc.warn("sp.Skeleton _ensureListener not support in native");
    // h5
    // if (!this._listener) {
    //     this._listener = new TrackEntryListeners();
    //     this._state && this._state.addListener(this._listener);
    // }
}

jsbSkeleton._updateSkeletonData = function () {
    if (this.skeletonData) {
        // jsb
        this.setSkeletonData(this.skeletonData);
        this.defaultSkin && this._skeleton.setSkin(this.defaultSkin);

        // h5
        // var data = this.skeletonData.getRuntimeData();
        // if (data) {
        //     try {
        //         this.setSkeletonData(data);

        //         this.setAnimationStateData(new spine.AnimationStateData(this._skeleton.data));
        //         this.defaultSkin && this._skeleton.setSkinByName(this.defaultSkin);
        //     } catch (e) {
        //         cc.warn(e);
        //     }
        //     this.animation = this.defaultAnimation;
        // }
    }
}