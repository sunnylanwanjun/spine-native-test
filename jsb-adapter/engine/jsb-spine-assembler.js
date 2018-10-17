/****************************************************************************
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
// !!! h5 engine need exports cc.StencilManager,now direct modify cocos2d-jsb.js file to export it
const StencilManager = cc.StencilManager.sharedManager;
const Skeleton = sp.Skeleton;
const renderer = cc.renderer;
const RenderFlow = cc.RenderFlow;
// !!! h5 engine need exports cc.VertexFormat,now direct modify cocos2d-jsb.js file to export it
const vfmtPosUvColor = cc.VertexFormat.vfmtPosUvColor;
const renderEngine = renderer.renderEngine;
const gfx = renderEngine.gfx;
const SpriteMaterial = renderEngine.SpriteMaterial;

const STENCIL_SEP = '@';

let _sharedMaterials = {};

let _slotColor = cc.color(0, 0, 255, 255);
let _boneColor = cc.color(255, 0, 0, 255);
let _originColor = cc.color(0, 255, 0, 255);
let _debugMaterial = new SpriteMaterial();
_debugMaterial.useModel = true;
_debugMaterial.useColor = false;
_debugMaterial.useTexture = false;
_debugMaterial.updateHash();

function _updateKeyWithStencilRef (key, stencilRef) {
    return key.replace(/@\d+$/, STENCIL_SEP + stencilRef);
}

function _getSlotMaterial (slot, tex) {
    let src=slot.blendStr, dst=slot.blendDst;

    let key = tex.url + src + dst + STENCIL_SEP + '0';
    let material = _sharedMaterials[key];
    if (!material) {
        material = new SpriteMaterial();
        material.useModel = true;
        // update texture
        material.texture = tex;
        material.useColor = false;

        // update blend function
        let pass = material._mainTech.passes[0];
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            src, dst,
            gfx.BLEND_FUNC_ADD,
            src, dst
        );
        _sharedMaterials[key] = material;
        material.updateHash(key);
    }
    else if (material.texture !== tex) {
        material.texture = tex;
        material.updateHash(key);
    }
    return material;
}

var spineAssembler = {
    // Use model to avoid per vertex transform
    useModel: true,

    _readAttachmentData (comp, slot, renderData, dataOffset) {
        // the vertices in format:
        // X1, Y1, C1R, C1G, C1B, C1A, U1, V1
        // get the vertex data
        let vertices = slot.vertexArray;
        let vertexCount = vertices.length / 8;
        // augment render data size to ensure capacity
        renderData.dataLength += vertexCount;
        let data = renderData._data;
        for (let i = 0, n = vertices.length; i < n; i += 8) {
            let r = vertices[i + 2],
                g = vertices[i + 3],
                b = vertices[i + 4],
                a = vertices[i + 5];
            let color = ((a<<24) >>> 0) + (b<<16) + (g<<8) + r;
            let content = data[dataOffset];
            content.x = vertices[i];
            content.y = vertices[i + 1];
            content.color = color;
            content.u = vertices[i + 6];
            content.v = vertices[i + 7];
            dataOffset++;
        }

        if (comp.debugSlots && vertexCount === 4) {
            let graphics = comp._debugRenderer;

            // Debug Slot
            let VERTEX = spine.RegionAttachment;
            graphics.strokeColor = _slotColor;
            graphics.lineWidth = 5;
            graphics.moveTo(vertices[VERTEX.X1], vertices[VERTEX.Y1]);
            graphics.lineTo(vertices[VERTEX.X2], vertices[VERTEX.Y2]);
            graphics.lineTo(vertices[VERTEX.X3], vertices[VERTEX.Y3]);
            graphics.lineTo(vertices[VERTEX.X4], vertices[VERTEX.Y4]);
            graphics.close();
            graphics.stroke();
        }

        return vertexCount;
    },

    genRenderDatas (comp, batchData) {
        let locSkeleton = comp._skeleton;
        let premultiAlpha = comp.premultipliedAlpha;
        let graphics = comp._debugRenderer;

        if (comp.debugBones || comp.debugSlots) {
            graphics.clear();
        }

        let attachment, slot, isMesh, isRegion;
        let dataId = 0, datas = comp._renderDatas, data = datas[dataId], newData = false;
        if (!data) {
            data = datas[dataId] = comp.requestRenderData();
        }
        data.dataLength = 0;
        let indices;
        let material = null, currMaterial = null;
        let vertexCount = 0, vertexOffset = 0;
        let indiceCount = 0, indiceOffset = 0;

        let jsbRenderData = locSkeleton.getRenderData(comp.node._color,premultiAlpha,comp.debugBones);
        let jsbSlots = jsbRenderData.getSlots();

        for (let i = 0, n = jsbSlots.length; i < n; i++) {
            slot = jsbSlots[i];
            if(!slot)continue;
            // get the vertices length
            vertexCount = slot.vertexArray.length;
            indiceCount = slot.indexArray.length;

            // no vertices to render
            if (vertexCount === 0) {
                continue;
            }

            newData = false;
            material = _getSlotMaterial(slot, slot.texture);
            if (!material) {
                continue;
            }
            // Check break
            if (currMaterial !== material) {
                if (currMaterial) {
                    newData = true;
                    data.material = currMaterial;
                }
                else {
                    // Init data material
                    data.material = material;
                }
                currMaterial = material;
            }

            // Request new render data and new vertex content
            if (newData) {
                // set old data vertex indice
                data.vertexCount = vertexOffset;
                data.indiceCount = indiceOffset;
                // gen new data
                dataId++;
                data = datas[dataId];
                if (!data) {
                    data = datas[dataId] = comp.requestRenderData();
                }
                data.dataLength = vertexCount;
                data.material = currMaterial;
                // reset offset
                vertexOffset = 0;
                indiceOffset = 0;
            }

            // Fill up indices
            indices = data._indices;
            if (isRegion) {
                indices[indiceOffset] = vertexOffset;
                indices[indiceOffset + 1] = vertexOffset + 1;
                indices[indiceOffset + 2] = vertexOffset + 2;
                indices[indiceOffset + 3] = vertexOffset + 0;
                indices[indiceOffset + 4] = vertexOffset + 2;
                indices[indiceOffset + 5] = vertexOffset + 3;
            } else {
                let triangles = slot.indexArray;
                for (let t = 0; t < triangles.length; t++) {
                    indices[indiceOffset + t] = vertexOffset + triangles[t];
                }
            }
            indiceOffset += indiceCount;
            // Fill up vertex render data
            vertexOffset += this._readAttachmentData(comp, slot, data, vertexOffset);
        }

        data.vertexCount = vertexOffset;
        data.indiceCount = indiceOffset;
        // Check for last data valid or not
        if (vertexOffset > 0 && indiceOffset > 0) {
            datas.length = dataId + 1;
        }
        else {
            datas.length = dataId;
        }

        if (comp.debugBones) {
            let jsbDebugBones = jsbRenderData.getDebugBones();
            let bone;
            graphics.lineWidth = 5;
            graphics.strokeColor = _boneColor;
            graphics.fillColor = _slotColor; // Root bone color is same as slot color.

            for (let i = 0, n = jsbDebugBones.length; i < n; i+=4) {
                let x = jsbDebugBones[i+2];
                let y = jsbDebugBones[i+3];

                // Bone lengths.
                graphics.moveTo(jsbDebugBones[i], jsbDebugBones[i+1]);
                graphics.lineTo(x, y);
                graphics.stroke();

                // Bone origins.
                graphics.circle(jsbDebugBones[i], jsbDebugBones[i+1], Math.PI * 2);
                graphics.fill();
                if (i === 0) {
                    graphics.fillColor = _originColor;
                }
            }
        }
    },

    updateRenderData (comp, batchData) {
        let skeleton = comp._skeleton;
        if (skeleton) {
            skeleton.updateWorldTransform();
            this.genRenderDatas(comp, batchData);
        }
        else {
            comp._renderDatas.length = 0;
        }
    },

    fillBuffers (comp, renderer) {
        let renderDatas = comp._renderDatas;
        for (let index = 0, length = renderDatas.length; index < length; index++) {
            let data = renderDatas[index];

            // For generate new material for skeleton render data nested in mask,
            // otherwise skeleton inside/outside mask with same material will interfere each other
            let key = data.material._hash;
            let newKey = _updateKeyWithStencilRef(key, StencilManager.getStencilRef());
            if (key !== newKey) {
                data.material = _sharedMaterials[newKey] || data.material.clone();
                data.material.updateHash(newKey);
                if (!_sharedMaterials[newKey]) {
                    _sharedMaterials[newKey] = data.material;
                }
            }

            if (data.material !== renderer.material) {
                renderer._flush();
                renderer.node = comp.node;
                renderer.material = data.material;
            }

            let vertexs = data._data;
            let indices = data._indices;

            let buffer = renderer.getBuffer('mesh', vfmtPosUvColor),
                vertexOffset = buffer.byteOffset >> 2,
                vertexCount = data.vertexCount;
            
            let indiceOffset = buffer.indiceOffset,
                vertexId = buffer.vertexOffset;
                
            buffer.request(vertexCount, data.indiceCount);

            // buffer data may be realloc, need get reference after request.
            let vbuf = buffer._vData,
                ibuf = buffer._iData,
                uintbuf = buffer._uintVData;

            // fill vertex buffer
            let vert;
            for (let i = 0, l = data.dataLength; i < l; i++) {
                vert = vertexs[i];
                vbuf[vertexOffset++] = vert.x;
                vbuf[vertexOffset++] = vert.y;
                vbuf[vertexOffset++] = vert.u;
                vbuf[vertexOffset++] = vert.v;
                uintbuf[vertexOffset++] = vert.color;
            }

            // index buffer
            for (let i = 0, l = indices.length; i < l; i ++) {
                ibuf[indiceOffset++] = vertexId + indices[i];
            }
        }

        comp.node._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA;
    }
};

Skeleton._assembler = spineAssembler;