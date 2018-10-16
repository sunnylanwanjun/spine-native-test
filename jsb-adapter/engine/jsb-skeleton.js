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
var SpriteMaterial = cc.renderer.renderEngine.SpriteMaterial;
var RenderComponent = cc.RenderComponent;
var Graphics = cc.Graphics;
var DefaultSkinsEnum = cc.Enum({
    default: -1
});
var DefaultAnimsEnum = cc.Enum({
    "<None>": 0
});

function setEnumAttr(obj, propName, enumDef) {
    cc.Class.attr(obj, propName, {
        type: "Enum",
        enumList: cc.Enum.getList(enumDef)
    });
}

sp.Skeleton = cc.Class({
    name: "sp.Skeleton",
    extends: RenderComponent,
    editor: false,
    properties: {

        /**
         * Record the listeners.just in native
         */
        _startListener: {
            default: null,
            serializable: false,
        },
        _endListener: {
            default: null,
            serializable: false,
        },
        _completeListener: {
            default: null,
            serializable: false,
        },
        _eventListener: {
            default: null,
            serializable: false,
        },
        _disposeListener: {
            default: null,
            serializable: false,
        },
        _interruptListener: {
            default: null,
            serializable: false,
        },

        paused: {
            default: false,
            visible: false
        },
        skeletonData: {
            default: null,
            type: sp.SkeletonData,
            notify: function () {
                this.defaultSkin = "";
                this.defaultAnimation = "";
                this._updateSkeletonData();
            },
            tooltip: false
        },
        defaultSkin: {
            default: "",
            visible: false
        },
        defaultAnimation: {
            default: "",
            visible: false
        },
        animation: {
            get: function () {
                var entry = this.getCurrent(0);
                return entry && entry.animation.name || "";
            },
            set: function (value) {
                this.defaultAnimation = value;
                if (value) this.setAnimation(0, value, this.loop);
                else {
                    this.clearTrack(0);
                    this.setToSetupPose();
                }
            },
            visible: false
        },
        _defaultSkinIndex: {
            get: function () {
                if (this.skeletonData && this.defaultSkin) {
                    var skinsEnum = this.skeletonData.getSkinsEnum();
                    if (skinsEnum) {
                        var skinIndex = skinsEnum[this.defaultSkin];
                        if (void 0 !== skinIndex) return skinIndex;
                    }
                }
                return 0;
            },
            set: function (value) {
                var skinsEnum;
                this.skeletonData && (skinsEnum = this.skeletonData.getSkinsEnum());
                if (!skinsEnum) return cc.errorID("", this.name);
                var skinName = skinsEnum[value];
                if (void 0 !== skinName) {
                    this.defaultSkin = skinName;
                } else {
                    cc.errorID(7501, this.name);
                }
            },
            type: DefaultSkinsEnum,
            visible: true,
            displayName: "Default Skin",
            tooltip: false
        },
        _animationIndex: {
            get: function () {
                var animationName = this.animation;
                if (this.skeletonData && animationName) {
                    var animsEnum = this.skeletonData.getAnimsEnum();
                    if (animsEnum) {
                        var animIndex = animsEnum[animationName];
                        if (void 0 !== animIndex) return animIndex;
                    }
                }
                return 0;
            },
            set: function (value) {
                if (0 === value) {
                    this.animation = "";
                    return;
                }
                var animsEnum;
                this.skeletonData && (animsEnum = this.skeletonData.getAnimsEnum());
                if (!animsEnum) return cc.errorID(7502, this.name);
                var animName = animsEnum[value];
                void 0 !== animName ? this.animation = animName : cc.errorID(7503, this.name);
            },
            type: DefaultAnimsEnum,
            visible: true,
            displayName: "Animation",
            tooltip: false
        },
        loop: {
            default: true,
            tooltip: false
        },
        premultipliedAlpha: {
            default: true,
            tooltip: false
        },
        timeScale: {
            default: 1,
            tooltip: false
        },
        debugSlots: {
            default: false,
            editorOnly: true,
            tooltip: false,
            notify: function () {
                this._initDebugDraw();
            }
        },
        debugBones: {
            default: false,
            editorOnly: true,
            tooltip: false,
            notify: function () {
                this._initDebugDraw();
            }
        }
    },
    ctor: function () {
        this._skeleton = null;
        this._rootBone = null;
        this._listener = null;
        this._boundingBox = cc.rect();
        this._material = new SpriteMaterial();
        this._renderDatas = [];
        this._debugRenderer = null;
        // save native spine texture delegate,avoid gc
        this._skeletonTextures = null;
    },
    setSkeletonData: function (skeletonData) {
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
            var spTex = new sp.Texture2D();
            spTex.setJSTex(texValues[i]);
            spTex.setPixelsWide(texValues[i].width);
            spTex.setPixelsHigh(texValues[i].height);
            textures[texKeys[i]] = spTex;
        }

        var skeletonAni = new sp.SkeletonAnimation();
        try {
            sp._initSkeletonRenderer(skeletonAni, jsonFile, atlasText, textures, skeletonData.scale);
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
    },
    setAnimationStateData: function (stateData) {
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
    },
    __preload: function () {
        this._updateSkeletonData();
    },
    update: function (dt) {
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
    },
    onRestore: function () {
        if (!this._material) {
            this._boundingBox = cc.rect();
            this._material = new SpriteMaterial();
            this._renderDatas = [];
        }
    },
    onDestroy: function () {
        this._super();
        this._renderDatas.length = 0;
    },
    updateWorldTransform: function () {
        this._skeleton && this._skeleton.updateWorldTransform();
    },
    setToSetupPose: function () {
        this._skeleton && this._skeleton.setToSetupPose();
    },
    setBonesToSetupPose: function () {
        this._skeleton && this._skeleton.setBonesToSetupPose();
    },
    setSlotsToSetupPose: function () {
        this._skeleton && this._skeleton.setSlotsToSetupPose();
    },
    findBone: function (boneName) {
        if (this._skeleton) return this._skeleton.findBone(boneName);
        return null;
    },
    findSlot: function (slotName) {
        if (this._skeleton) return this._skeleton.findSlot(slotName);
        return null;
    },
    setSkin: function (skinName) {
        if (this._skeleton) return this._skeleton.setSkin(skinName);
        return null;
    },
    getAttachment: function (slotName, attachmentName) {
        if (this._skeleton) return this._skeleton.getAttachment(slotName, attachmentName);
        return null;
    },
    setAttachment: function (slotName, attachmentName) {
        this._skeleton && this._skeleton.setAttachment(slotName, attachmentName);
    },
    getTextureAtlas: function (regionAttachment) {
        // jsb
        cc.warn("sp.Skeleton getTextureAtlas not support in native");
        return null;
        // h5
        //return regionAttachment.region;
    },
    setMix: function (fromAnimation, toAnimation, duration) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setMix(fromAnimation, toAnimation, duration);
        }
        // h5
        // this._state && this._state.data.setMix(fromAnimation, toAnimation, duration);
    },
    setAnimation: function (trackIndex, name, loop) {
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
    },
    addAnimation: function (trackIndex, name, loop, delay) {
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
    },
    findAnimation: function (name) {
        // jsb
        if (this._skeleton) return this._skeleton.findAnimation(name);
        // h5
        // if (this._skeleton) return this._skeleton.data.findAnimation(name);
        return null;
    },
    getCurrent: function (trackIndex) {
        // jsb
        if (this._skeleton) {
            return this._skeleton.getCurrent(trackIndex);
        }
        // h5
        // if (this._state) return this._state.getCurrent(trackIndex);
        return null;
    },
    clearTracks: function () {
        // jsb
        if (this._skeleton) {
            this._skeleton.clearTracks();
        }
        // h5
        // this._state && this._state.clearTracks();
    },
    clearTrack: function (trackIndex) {
        // jsb
        if (this._skeleton) {
            this._skeleton.clearTrack(trackIndex);
        }
        // h5
        // if (this._state) {
        //     this._state.clearTrack(trackIndex);
        // }
    },
    setStartListener: function (listener) {
        // jsb
        this._startListener = listener;
        if (this._skeleton) {
            this._skeleton.setStartListener(listener);
        }
        // h5
        // this._ensureListener();
        // this._listener.start = listener;
    },
    setInterruptListener: function (listener) {
        // jsb
        this._interruptListener = listener;
        if (this._skeleton) {
            this._skeleton.setInterruptListener(listener);
        }
        
        // h5
        // this._ensureListener();
        // this._listener.interrupt = listener;
    },
    setEndListener: function (listener) {
        // jsb
        this._endListener = listener;
        if (this._skeleton) {
            this._skeleton.setEndListener(listener);
        }

        // h5
        // this._ensureListener();
        // this._listener.end = listener;
    },
    setDisposeListener: function (listener) {
        // jsb
        this._disposeListener = listener;
        if (this._skeleton) {
            this._skeleton.setDisposeListener(listener);
        }

        // h5
        // this._ensureListener();
        // this._listener.dispose = listener;
    },
    setCompleteListener: function (listener) {
        // jsb
        this._completeListener = listener;
        if (this._skeleton) {
            this._skeleton.setCompleteListener(listener);
        }

        // h5
        // this._ensureListener();
        // this._listener.complete = listener;
    },
    setEventListener: function (listener) {
        // jsb
        this._eventListener = listener;
        if (this._skeleton) {
            this._skeleton.setEventListener(listener);
        }

        // h5
        // this._ensureListener();
        // this._listener.event = listener;
    },
    setTrackStartListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackStartListener(entry, listener);
        }
        // h5
        // TrackEntryListeners.getListeners(entry).start = listener;
    },
    setTrackInterruptListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackInterruptListener(entry, listener);
        }

        // h5
        // TrackEntryListeners.getListeners(entry).interrupt = listener;
    },
    setTrackEndListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackEndListener(entry, listener);
        }

        // h5
        // TrackEntryListeners.getListeners(entry).end = listener;
    },
    setTrackDisposeListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackDisposeListener(entry, listener);
        }

        // h5
        // TrackEntryListeners.getListeners(entry).dispose = listener;
    },
    setTrackCompleteListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackCompleteListener(entry, listener);
        }

        // h5
        // TrackEntryListeners.getListeners(entry).complete = function (trackEntry) {
        //     var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
        //     listener(trackEntry, loopCount);
        // };
    },
    setTrackEventListener: function (entry, listener) {
        // jsb
        if (this._skeleton) {
            this._skeleton.setTrackEventListener(entry, listener);
        }

        // h5
        // TrackEntryListeners.getListeners(entry).event = listener;
    },
    getState: function () {
        // jsb
        if (this._skeleton) {
            return this._skeleton.getState();
        }

        // h5
        // return this._state;
    },
    _updateAnimEnum: false,
    _updateSkinEnum: false,
    _ensureListener: function () {
        cc.warn("sp.Skeleton _ensureListener not support in native");
        // h5
        // if (!this._listener) {
        //     this._listener = new TrackEntryListeners();
        //     this._state && this._state.addListener(this._listener);
        // }
    },
    _updateSkeletonData: function () {
        if (this.skeletonData) {
            var data = this.skeletonData.getRuntimeData();
            if (data) {
                try {
                    this.setSkeletonData(data);
                    // jsb
                    this.defaultSkin && this._skeleton.setSkin(this.defaultSkin);

                    // h5
                    // this.setAnimationStateData(new spine.AnimationStateData(this._skeleton.data));
                    // this.defaultSkin && this._skeleton.setSkinByName(this.defaultSkin);
                } catch (e) {
                    cc.warn(e);
                }
                this.animation = this.defaultAnimation;
            }
        }
    },
    _refreshInspector: function () {
        this._updateAnimEnum();
        this._updateSkinEnum();
        Editor.Utils.refreshSelectedInspector("node", this.node.uuid);
    },
    _initDebugDraw: function () {
        if (this.debugBones || this.debugSlots) {
            if (!this._debugRenderer) {
                var debugDrawNode = new cc.PrivateNode();
                debugDrawNode.name = "DEBUG_DRAW_NODE";
                var debugDraw = debugDrawNode.addComponent(Graphics);
                debugDraw.lineWidth = 1;
                debugDraw.strokeColor = cc.color(255, 0, 0, 255);
                this._debugRenderer = debugDraw;
            }
            this._debugRenderer.node.parent = this.node;
        } else this._debugRenderer && (this._debugRenderer.node.parent = null);
    }
});