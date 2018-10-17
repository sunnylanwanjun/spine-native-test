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

function _getSlotMaterial (src, dst, tex) {

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

    _readAttachmentData (comp, slotsReader, vertexCount, renderData, dataOffset) {
        // the vertices in format:
        // X1, Y1, C1R, C1G, C1B, C1A, U1, V1
        // get the vertex data
        // augment render data size to ensure capacity
        renderData.dataLength += vertexCount;
        let data = renderData._data;

        for (let i = 0; i < vertexCount; i++) {
            
            let content = data[dataOffset];
            content.x = slotsReader.getFloat32();
            content.y = slotsReader.getFloat32();
            //z ignore
            slotsReader.getFloat32();

            let r = slotsReader.getUint8(),
                g = slotsReader.getUint8(),
                b = slotsReader.getUint8(),
                a = slotsReader.getUint8()
            let color = ((a<<24) >>> 0) + (b<<16) + (g<<8) + r;
            content.color = color;

            content.u = slotsReader.getFloat32();
            content.v = slotsReader.getFloat32();

            dataOffset++;
        }

        if (comp.debugSlots && vertexCount === 4) {
            let debugIdx = dataOffset - vertexCount;
            let graphics = comp._debugRenderer;

            // Debug Slot
            let VERTEX = spine.RegionAttachment;
            graphics.strokeColor = _slotColor;
            graphics.lineWidth = 5;
            graphics.moveTo(data[debugIdx+VERTEX.X1], data[debugIdx+VERTEX.Y1]);
            graphics.lineTo(data[debugIdx+VERTEX.X2], data[debugIdx+VERTEX.Y2]);
            graphics.lineTo(data[debugIdx+VERTEX.X3], data[debugIdx+VERTEX.Y3]);
            graphics.lineTo(data[debugIdx+VERTEX.X4], data[debugIdx+VERTEX.Y4]);
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

        let attachment, slot, isMesh, isRegion, realTexture, realTextureIndex,blendSrc,blendDst;
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
        let slotsLen = jsbRenderData.getSlotsLen();
        let bonesLen = jsbRenderData.getBonesLen();
        let slotsBuffer = jsbRenderData.getSlots();

        let slotsReader = new DataView(slotsBuffer,0,slotsBuffer.byteLength);

        for (let i = 0, n = slotsLen; i < n; i++) {
            realTextureIndex = slotsReader.getUint32();
            realTexture = comp.skeletonData.textures[realTextureIndex];

            blendSrc = slotsReader.getUint32();
            blendDst = slotsReader.getUint32();

            // get the vertices length
            indiceCount = slotsReader.getUint32();
            vertexCount = slotsReader.getUint32();

            // no vertices to render
            if (vertexCount === 0) {
                continue;
            }

            newData = false;
            
            material = _getSlotMaterial(blendSrc, blendDst, realTexture);
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
                for (let t = 0; t < indiceCount; t++) {
                    var indexVal = slotsReader.getUint16();
                    indices[indiceOffset + t] = vertexOffset + indexVal;
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

        if (comp.debugBones && bonesLen>0) {
            graphics.lineWidth = 5;
            graphics.strokeColor = _boneColor;
            graphics.fillColor = _slotColor; // Root bone color is same as slot color.

            for (let i = 0, n = bonesLen; i < n; i+=4) {
                let bx = slotsReader.getFloat32();
                let by = slotsReader.getFloat32();
                let x = slotsReader.getFloat32();
                let y = slotsReader.getFloat32();

                // Bone lengths.
                graphics.moveTo(bx, by);
                graphics.lineTo(x, y);
                graphics.stroke();

                // Bone origins.
                graphics.circle(bx, by, Math.PI * 2);
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