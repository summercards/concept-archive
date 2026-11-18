/* three.js addons 适配器 · 只补 modeling-kit 用到的那一个入口
 * ---------------------------------------------------------------
 * modeling-kit 的 merge() 依赖 three/addons/utils/BufferGeometryUtils.js 的
 * mergeGeometries。原工程把它一起打包在 IIFE 里，抽不出来，所以在预览宿主这边
 * 补一份等价实现——和 THREE 本身一样，它是"宿主依赖"，不是资产。
 *
 * 行为对齐 three r160 的 mergeGeometries：属性逐条拼接、索引按顶点基址偏移、
 * 有 groups 就保留 groups。不做 morph 属性（资产里没用到）。
 */
(function () {
  "use strict";
  var T = window.THREE;

  window.__mergeGeometries = function (geometries, useGroups) {
    if (!Array.isArray(geometries) || geometries.length === 0) return null;

    var isIndexed = geometries[0].index !== null;
    var names = Object.keys(geometries[0].attributes);
    var i, k;

    for (i = 0; i < geometries.length; i++) {
      var g = geometries[i];
      if ((g.index !== null) !== isIndexed) return null;
      for (k = 0; k < names.length; k++) {
        if (g.attributes[names[k]] === undefined) return null;
      }
    }

    var merged = new T.BufferGeometry();
    var totalVerts = 0;
    for (i = 0; i < geometries.length; i++) totalVerts += geometries[i].attributes.position.count;

    for (k = 0; k < names.length; k++) {
      var name = names[k];
      var a0 = geometries[0].attributes[name];
      var arr = new a0.array.constructor(totalVerts * a0.itemSize);
      var off = 0;
      for (i = 0; i < geometries.length; i++) {
        var src = geometries[i].attributes[name].array;
        arr.set(src, off);
        off += src.length;
      }
      merged.setAttribute(name, new T.BufferAttribute(arr, a0.itemSize, a0.normalized));
    }

    if (isIndexed) {
      var totalIdx = 0;
      for (i = 0; i < geometries.length; i++) totalIdx += geometries[i].index.count;
      var idx = totalVerts > 65535 ? new Uint32Array(totalIdx) : new Uint16Array(totalIdx);
      var io = 0, vo = 0;
      for (i = 0; i < geometries.length; i++) {
        var gi = geometries[i].index.array;
        for (k = 0; k < gi.length; k++) idx[io + k] = gi[k] + vo;
        io += gi.length;
        vo += geometries[i].attributes.position.count;
      }
      merged.setIndex(new T.BufferAttribute(idx, 1));
    }

    var needGroups = useGroups;
    if (!needGroups) {
      for (i = 0; i < geometries.length; i++) {
        if (geometries[i].groups.length) { needGroups = true; break; }
      }
    }
    if (needGroups) {
      var iOff = 0;
      for (i = 0; i < geometries.length; i++) {
        var gg = geometries[i];
        var cnt = gg.index ? gg.index.count : gg.attributes.position.count;
        if (gg.groups.length) {
          for (k = 0; k < gg.groups.length; k++) {
            merged.addGroup(gg.groups[k].start + iOff, gg.groups[k].count, gg.groups[k].materialIndex);
          }
        } else {
          merged.addGroup(iOff, cnt, 0);
        }
        iOff += cnt;
      }
    }

    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  };
})();
