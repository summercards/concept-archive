// 由 tools/stash.py 生成：原版几何函数的原字节 + 别名映射。
// 不要手改。对照目标：assets/code/modeling-kit.js
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const nt = THREE.BufferGeometry;
const et = THREE.Float32BufferAttribute;
const W = THREE.Vector3;
const Ys = THREE.CylinderGeometry;
const un = THREE.BoxGeometry;
const Jr = THREE.CatmullRomCurve3;
const Kr = THREE.TubeGeometry;
const Lt = THREE.Quaternion;
const Ye = THREE.Matrix4;
const In = THREE.Euler;
const sa = mergeGeometries;
const oa = new THREE.Vector3();
// je() 用的模块级临时对象，原版是共享变量，这里原样复刻
var f1 = new In, Fc = new Lt, g3 = new Ye, d1 = new W, p1 = new W(1, 1, 1);

function p3(i,e,t,n=.01,s="center"){n=Math.max(5e-4,Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4));let o=i/2,r=e/2,a=t/2,l=new Float32Array(72),c=new Float32Array(72),u=new Float32Array(48),h=(x,y,b,m)=>((x>0?1:0)+(y>0?2:0)+(b>0?4:0))*3+m;for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1]){let m=[[x*o,y*(r-n),b*(a-n)],[x*(o-n),y*r,b*(a-n)],[x*(o-n),y*(r-n),b*a]],A=[[x,0,0],[0,y,0],[0,0,b]];for(let _=0;_<3;_++){let M=h(x,y,b,_);l.set(m[_],M*3),c.set(A[_],M*3),_===0?(u[M*2]=m[_][2],u[M*2+1]=m[_][1]):_===1?(u[M*2]=m[_][0],u[M*2+1]=m[_][2]):(u[M*2]=m[_][0],u[M*2+1]=m[_][1])}}let f=[],p=(x,y,b)=>{let m=l[x*3],A=l[x*3+1],_=l[x*3+2],M=l[y*3]-m,E=l[y*3+1]-A,w=l[y*3+2]-_,S=l[b*3]-m,z=l[b*3+1]-A,H=l[b*3+2]-_,O=E*H-w*z,q=w*S-M*H,U=M*z-E*S,T=m+(M+S)/3,D=A+(E+z)/3,C=_+(w+H)/3;O*T+q*D+U*C>=0?f.push(x,y,b):f.push(x,b,y)},d=(x,y,b,m)=>{p(x,y,b),p(x,b,m)},v=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let x of[-1,1])d(...v.map(([y,b])=>h(x,y,b,0))),d(...v.map(([y,b])=>h(y,x,b,1))),d(...v.map(([y,b])=>h(y,b,x,2)));for(let x of[-1,1])for(let y of[-1,1])d(h(-1,x,y,1),h(1,x,y,1),h(1,x,y,2),h(-1,x,y,2)),d(h(x,-1,y,0),h(x,1,y,0),h(x,1,y,2),h(x,-1,y,2)),d(h(x,y,-1,0),h(x,y,1,0),h(x,y,1,1),h(x,y,-1,1));for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1])p(h(x,y,b,0),h(x,y,b,1),h(x,y,b,2));let g=new nt;return g.setAttribute("position",new et(l,3)),g.setAttribute("normal",new et(c,3)),g.setAttribute("uv",new et(u,2)),g.setIndex(f),s==="bottom"&&g.translate(0,e/2,0),g}

function Wi(i,e,t,n=.02,s="center"){n=Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4);let o=new un(i,e,t,3,3,3),r=o.attributes.position,a=o.attributes.normal,l=o.attributes.uv,c=i/2,u=e/2,h=t/2,f=(p,d)=>{let v=Math.abs(p),g=Math.sign(p);return v>d-1e-5?g*d:g*(d-n)};for(let p=0;p<r.count;p++){let d=f(r.getX(p),c),v=f(r.getY(p),u),g=f(r.getZ(p),h),x=Math.max(-(c-n),Math.min(c-n,d)),y=Math.max(-(u-n),Math.min(u-n,v)),b=Math.max(-(h-n),Math.min(h-n,g));if(oa.set(d-x,v-y,g-b),oa.lengthSq()>1e-10){oa.normalize();let M=a.getX(p),E=a.getY(p),w=a.getZ(p);(Math.abs(d)>c-1e-5?1:0)+(Math.abs(v)>u-1e-5?1:0)+(Math.abs(g)>h-1e-5?1:0)>=2?(d=x+oa.x*n,v=y+oa.y*n,g=b+oa.z*n,a.setXYZ(p,oa.x,oa.y,oa.z)):a.setXYZ(p,M,E,w)}r.setXYZ(p,d,v,g);let m=Math.abs(a.getX(p)),A=Math.abs(a.getY(p)),_=Math.abs(a.getZ(p));m>=A&&m>=_?l.setXY(p,g,v):A>=m&&A>=_?l.setXY(p,d,g):l.setXY(p,d,v)}return s==="bottom"&&o.translate(0,e/2,0),o}

function ot(i,e,t,n=16,s=!1,o="center"){let r=new Ys(i,e,t,n,1,s),a=r.attributes.uv,l=r.attributes.position,c=r.attributes.normal,u=Math.PI*(i+e);for(let h=0;h<a.count;h++)Math.abs(c.getY(h))>.9?a.setXY(h,l.getX(h),l.getZ(h)):a.setXY(h,a.getX(h)*u,l.getY(h));return o==="bottom"&&r.translate(0,t/2,0),r}

function Fn(i,e=.03,t=8,n=!1,s=0){let o=i.map(h=>h.isVector3?h:new W(h[0],h[1],h[2])),r=new Jr(o,n,"catmullrom",s),a=r.getLength(),l=Math.max(2,Math.ceil(a/Math.max(.08,e*3))),c=new Kr(r,Math.min(l,400),e,t,n),u=c.attributes.uv;for(let h=0;h<u.count;h++)u.setXY(h,u.getX(h)*a,u.getY(h)*Math.PI*2*e);return c}

function je(i,e=0,t=0,n=0,s=null){return s?(f1.set(s[0],s[1],s[2]),Fc.setFromEuler(f1)):Fc.identity(),d1.set(e,t,n),g3.compose(d1,Fc,p1),i.applyMatrix4(g3),i}

function Lc(i,e){let t=i.attributes.position,n=t.count,s=new Float32Array(n*3);for(let o=0;o<n;o++){let r=typeof e=="function"?e(t.getX(o),t.getY(o),t.getZ(o)):e;s[o*3]=r[0],s[o*3+1]=r[1],s[o*3+2]=r[2]}return i.setAttribute("color",new et(s,3)),i}

function Ii(i){let e=i.filter(Boolean).map(l=>(l.attributes.uv||l.setAttribute("uv",new et(new Float32Array(l.attributes.position.count*2),2)),l.attributes.normal||l.computeVertexNormals(),l));if(!e.length)return new nt;let t=e.some(l=>l.attributes.color),n=e.map(l=>{let c=(l.index,l);if(t&&!c.attributes.color){let u=new Float32Array(c.attributes.position.count*3).fill(1);c.setAttribute("color",new et(u,3))}for(let u of Object.keys(c.attributes))["position","normal","uv","color"].includes(u)||c.deleteAttribute(u);return c}),s=n.every(l=>l.index),o=n.every(l=>!l.index),r=s||o?n:n.map(l=>l.index?l.toNonIndexed():l);return sa(r,!1)||new nt}
export const metricBox = p3;
export const bevelBox = Wi;
export const cylinder = ot;
export const tube = Fn;
export const place = je;
export const vertexColor = Lc;
export const merge = Ii;
