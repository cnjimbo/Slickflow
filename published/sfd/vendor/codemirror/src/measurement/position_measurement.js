import{buildLineContent,LineView}from"../line/line_data.js";import{clipPos,Pos}from"../line/pos.js";import{collapsedSpanAround,heightAtLine,lineIsHidden,visualLine}from"../line/spans.js";import{getLine,lineAtHeight,lineNo,updateLineHeight}from"../line/utils_line.js";import{bidiOther,getBidiPartAt,getOrder}from"../util/bidi.js";import{chrome,android,ie,ie_version}from"../util/browser.js";import{elt,removeChildren,range,removeChildrenAndAdd}from"../util/dom.js";import{e_target}from"../util/event.js";import{hasBadZoomedRects}from"../util/feature_detection.js";import{countColumn,findFirst,isExtendingChar,scrollerGap,skipExtendingChars}from"../util/misc.js";import{updateLineForChanges}from"../display/update_line.js";import{widgetHeight}from"./widgets.js";export function paddingTop(e){return e.lineSpace.offsetTop}export function paddingVert(e){return e.mover.offsetHeight-e.lineSpace.offsetHeight}export function paddingH(e){if(e.cachedPaddingH)return e.cachedPaddingH;let t=removeChildrenAndAdd(e.measure,elt("pre","x","CodeMirror-line-like")),r=window.getComputedStyle?window.getComputedStyle(t):t.currentStyle,i={left:parseInt(r.paddingLeft),right:parseInt(r.paddingRight)};return isNaN(i.left)||isNaN(i.right)||(e.cachedPaddingH=i),i}export function scrollGap(e){return scrollerGap-e.display.nativeBarWidth}export function displayWidth(e){return e.display.scroller.clientWidth-scrollGap(e)-e.display.barWidth}export function displayHeight(e){return e.display.scroller.clientHeight-scrollGap(e)-e.display.barHeight}function ensureLineHeights(e,t,r){let i=e.options.lineWrapping,n=i&&displayWidth(e);if(!t.measure.heights||i&&t.measure.width!=n){let e=t.measure.heights=[];if(i){t.measure.width=n;let i=t.text.firstChild.getClientRects();for(let t=0;t<i.length-1;t++){let n=i[t],o=i[t+1];Math.abs(n.bottom-o.bottom)>2&&e.push((n.bottom+o.top)/2-r.top)}}e.push(r.bottom-r.top)}}export function mapFromLineView(e,t,r){if(e.line==t)return{map:e.measure.map,cache:e.measure.cache};if(e.rest){for(let r=0;r<e.rest.length;r++)if(e.rest[r]==t)return{map:e.measure.maps[r],cache:e.measure.caches[r]};for(let t=0;t<e.rest.length;t++)if(lineNo(e.rest[t])>r)return{map:e.measure.maps[t],cache:e.measure.caches[t],before:!0}}}function updateExternalMeasurement(e,t){t=visualLine(t);let r=lineNo(t),i=e.display.externalMeasured=new LineView(e.doc,t,r);i.lineN=r;let n=i.built=buildLineContent(e,i);return i.text=n.pre,removeChildrenAndAdd(e.display.lineMeasure,n.pre),i}export function measureChar(e,t,r,i){return measureCharPrepared(e,prepareMeasureForLine(e,t),r,i)}export function findViewForLine(e,t){if(t>=e.display.viewFrom&&t<e.display.viewTo)return e.display.view[findViewIndex(e,t)];let r=e.display.externalMeasured;return r&&t>=r.lineN&&t<r.lineN+r.size?r:void 0}export function prepareMeasureForLine(e,t){let r=lineNo(t),i=findViewForLine(e,r);i&&!i.text?i=null:i&&i.changes&&(updateLineForChanges(e,i,r,getDimensions(e)),e.curOp.forceUpdate=!0),i||(i=updateExternalMeasurement(e,t));let n=mapFromLineView(i,t,r);return{line:t,view:i,rect:null,map:n.map,cache:n.cache,before:n.before,hasHeights:!1}}export function measureCharPrepared(e,t,r,i,n){t.before&&(r=-1);let o,l=r+(i||"");return t.cache.hasOwnProperty(l)?o=t.cache[l]:(t.rect||(t.rect=t.view.text.getBoundingClientRect()),t.hasHeights||(ensureLineHeights(e,t.view,t.rect),t.hasHeights=!0),o=measureCharInner(e,t,r,i),o.bogus||(t.cache[l]=o)),{left:o.left,right:o.right,top:n?o.rtop:o.top,bottom:n?o.rbottom:o.bottom}}let measureText,nullRect={left:0,right:0,top:0,bottom:0};export function nodeAndOffsetInLineMap(e,t,r){let i,n,o,l,a,d;for(let s=0;s<e.length;s+=3)if(a=e[s],d=e[s+1],t<a?(n=0,o=1,l="left"):t<d?(n=t-a,o=n+1):(s==e.length-3||t==d&&e[s+3]>t)&&(o=d-a,n=o-1,t>=d&&(l="right")),null!=n){if(i=e[s+2],a==d&&r==(i.insertLeft?"left":"right")&&(l=r),"left"==r&&0==n)for(;s&&e[s-2]==e[s-3]&&e[s-1].insertLeft;)i=e[2+(s-=3)],l="left";if("right"==r&&n==d-a)for(;s<e.length-3&&e[s+3]==e[s+4]&&!e[s+5].insertLeft;)i=e[(s+=3)+2],l="right";break}return{node:i,start:n,end:o,collapse:l,coverStart:a,coverEnd:d}}function getUsefulRect(e,t){let r=nullRect;if("left"==t)for(let t=0;t<e.length&&(r=e[t]).left==r.right;t++);else for(let t=e.length-1;t>=0&&(r=e[t]).left==r.right;t--);return r}function measureCharInner(e,t,r,i){let n,o=nodeAndOffsetInLineMap(t.map,r,i),l=o.node,a=o.start,d=o.end,s=o.collapse;if(3==l.nodeType){for(let e=0;e<4;e++){for(;a&&isExtendingChar(t.line.text.charAt(o.coverStart+a));)--a;for(;o.coverStart+d<o.coverEnd&&isExtendingChar(t.line.text.charAt(o.coverStart+d));)++d;if(n=ie&&ie_version<9&&0==a&&d==o.coverEnd-o.coverStart?l.parentNode.getBoundingClientRect():getUsefulRect(range(l,a,d).getClientRects(),i),n.left||n.right||0==a)break;d=a,a-=1,s="right"}ie&&ie_version<11&&(n=maybeUpdateRectForZooming(e.display.measure,n))}else{let t;a>0&&(s=i="right"),n=e.options.lineWrapping&&(t=l.getClientRects()).length>1?t["right"==i?t.length-1:0]:l.getBoundingClientRect()}if(ie&&ie_version<9&&!a&&(!n||!n.left&&!n.right)){let t=l.parentNode.getClientRects()[0];n=t?{left:t.left,right:t.left+charWidth(e.display),top:t.top,bottom:t.bottom}:nullRect}let c=n.top-t.rect.top,p=n.bottom-t.rect.top,u=(c+p)/2,f=t.view.measure.heights,h=0;for(;h<f.length-1&&!(u<f[h]);h++);let g=h?f[h-1]:0,m=f[h],x={left:("right"==s?n.right:n.left)-t.rect.left,right:("left"==s?n.left:n.right)-t.rect.left,top:g,bottom:m};return n.left||n.right||(x.bogus=!0),e.options.singleCursorHeightPerLine||(x.rtop=c,x.rbottom=p),x}function maybeUpdateRectForZooming(e,t){if(!window.screen||null==screen.logicalXDPI||screen.logicalXDPI==screen.deviceXDPI||!hasBadZoomedRects(e))return t;let r=screen.logicalXDPI/screen.deviceXDPI,i=screen.logicalYDPI/screen.deviceYDPI;return{left:t.left*r,right:t.right*r,top:t.top*i,bottom:t.bottom*i}}export function clearLineMeasurementCacheFor(e){if(e.measure&&(e.measure.cache={},e.measure.heights=null,e.rest))for(let t=0;t<e.rest.length;t++)e.measure.caches[t]={}}export function clearLineMeasurementCache(e){e.display.externalMeasure=null,removeChildren(e.display.lineMeasure);for(let t=0;t<e.display.view.length;t++)clearLineMeasurementCacheFor(e.display.view[t])}export function clearCaches(e){clearLineMeasurementCache(e),e.display.cachedCharWidth=e.display.cachedTextHeight=e.display.cachedPaddingH=null,e.options.lineWrapping||(e.display.maxLineChanged=!0),e.display.lineNumChars=null}function pageScrollX(){return chrome&&android?-(document.body.getBoundingClientRect().left-parseInt(getComputedStyle(document.body).marginLeft)):window.pageXOffset||(document.documentElement||document.body).scrollLeft}function pageScrollY(){return chrome&&android?-(document.body.getBoundingClientRect().top-parseInt(getComputedStyle(document.body).marginTop)):window.pageYOffset||(document.documentElement||document.body).scrollTop}function widgetTopHeight(e){let{widgets:t}=visualLine(e),r=0;if(t)for(let e=0;e<t.length;++e)t[e].above&&(r+=widgetHeight(t[e]));return r}export function intoCoordSystem(e,t,r,i,n){if(!n){let e=widgetTopHeight(t);r.top+=e,r.bottom+=e}if("line"==i)return r;i||(i="local");let o=heightAtLine(t);if("local"==i?o+=paddingTop(e.display):o-=e.display.viewOffset,"page"==i||"window"==i){let t=e.display.lineSpace.getBoundingClientRect();o+=t.top+("window"==i?0:pageScrollY());let n=t.left+("window"==i?0:pageScrollX());r.left+=n,r.right+=n}return r.top+=o,r.bottom+=o,r}export function fromCoordSystem(e,t,r){if("div"==r)return t;let i=t.left,n=t.top;if("page"==r)i-=pageScrollX(),n-=pageScrollY();else if("local"==r||!r){let t=e.display.sizer.getBoundingClientRect();i+=t.left,n+=t.top}let o=e.display.lineSpace.getBoundingClientRect();return{left:i-o.left,top:n-o.top}}export function charCoords(e,t,r,i,n){return i||(i=getLine(e.doc,t.line)),intoCoordSystem(e,i,measureChar(e,i,t.ch,n),r)}export function cursorCoords(e,t,r,i,n,o){function l(t,l){let a=measureCharPrepared(e,n,t,l?"right":"left",o);return l?a.left=a.right:a.right=a.left,intoCoordSystem(e,i,a,r)}i=i||getLine(e.doc,t.line),n||(n=prepareMeasureForLine(e,i));let a=getOrder(i,e.doc.direction),d=t.ch,s=t.sticky;if(d>=i.text.length?(d=i.text.length,s="before"):d<=0&&(d=0,s="after"),!a)return l("before"==s?d-1:d,"before"==s);function c(e,t,r){return l(r?e-1:e,1==a[t].level!=r)}let p=getBidiPartAt(a,d,s),u=bidiOther,f=c(d,p,"before"==s);return null!=u&&(f.other=c(d,u,"before"!=s)),f}export function estimateCoords(e,t){let r=0;t=clipPos(e.doc,t),e.options.lineWrapping||(r=charWidth(e.display)*t.ch);let i=getLine(e.doc,t.line),n=heightAtLine(i)+paddingTop(e.display);return{left:r,right:r,top:n,bottom:n+i.height}}function PosWithInfo(e,t,r,i,n){let o=Pos(e,t,r);return o.xRel=n,i&&(o.outside=i),o}export function coordsChar(e,t,r){let i=e.doc;if((r+=e.display.viewOffset)<0)return PosWithInfo(i.first,0,null,-1,-1);let n=lineAtHeight(i,r),o=i.first+i.size-1;if(n>o)return PosWithInfo(i.first+i.size-1,getLine(i,o).text.length,null,1,1);t<0&&(t=0);let l=getLine(i,n);for(;;){let o=coordsCharInner(e,l,n,t,r),a=collapsedSpanAround(l,o.ch+(o.xRel>0||o.outside>0?1:0));if(!a)return o;let d=a.find(1);if(d.line==n)return d;l=getLine(i,n=d.line)}}function wrappedLineExtent(e,t,r,i){i-=widgetTopHeight(t);let n=t.text.length,o=findFirst((t=>measureCharPrepared(e,r,t-1).bottom<=i),n,0);return n=findFirst((t=>measureCharPrepared(e,r,t).top>i),o,n),{begin:o,end:n}}export function wrappedLineExtentChar(e,t,r,i){return r||(r=prepareMeasureForLine(e,t)),wrappedLineExtent(e,t,r,intoCoordSystem(e,t,measureCharPrepared(e,r,i),"line").top)}function boxIsAfter(e,t,r,i){return!(e.bottom<=r)&&(e.top>r||(i?e.left:e.right)>t)}function coordsCharInner(e,t,r,i,n){n-=heightAtLine(t);let o=prepareMeasureForLine(e,t),l=widgetTopHeight(t),a=0,d=t.text.length,s=!0,c=getOrder(t,e.doc.direction);if(c){let l=(e.options.lineWrapping?coordsBidiPartWrapped:coordsBidiPart)(e,t,r,o,c,i,n);s=1!=l.level,a=s?l.from:l.to-1,d=s?l.to:l.from-1}let p,u,f=null,h=null,g=findFirst((t=>{let r=measureCharPrepared(e,o,t);return r.top+=l,r.bottom+=l,!!boxIsAfter(r,i,n,!1)&&(r.top<=n&&r.left<=i&&(f=t,h=r),!0)}),a,d),m=!1;if(h){let e=i-h.left<h.right-i,t=e==s;g=f+(t?0:1),u=t?"after":"before",p=e?h.left:h.right}else{s||g!=d&&g!=a||g++,u=0==g?"after":g==t.text.length?"before":measureCharPrepared(e,o,g-(s?1:0)).bottom+l<=n==s?"after":"before";let i=cursorCoords(e,Pos(r,g,u),"line",t,o);p=i.left,m=n<i.top?-1:n>=i.bottom?1:0}return g=skipExtendingChars(t.text,g,1),PosWithInfo(r,g,u,m,i-p)}function coordsBidiPart(e,t,r,i,n,o,l){let a=findFirst((a=>{let d=n[a],s=1!=d.level;return boxIsAfter(cursorCoords(e,Pos(r,s?d.to:d.from,s?"before":"after"),"line",t,i),o,l,!0)}),0,n.length-1),d=n[a];if(a>0){let s=1!=d.level,c=cursorCoords(e,Pos(r,s?d.from:d.to,s?"after":"before"),"line",t,i);boxIsAfter(c,o,l,!0)&&c.top>l&&(d=n[a-1])}return d}function coordsBidiPartWrapped(e,t,r,i,n,o,l){let{begin:a,end:d}=wrappedLineExtent(e,t,i,l);/\s/.test(t.text.charAt(d-1))&&d--;let s=null,c=null;for(let t=0;t<n.length;t++){let r=n[t];if(r.from>=d||r.to<=a)continue;let l=measureCharPrepared(e,i,1!=r.level?Math.min(d,r.to)-1:Math.max(a,r.from)).right,p=l<o?o-l+1e9:l-o;(!s||c>p)&&(s=r,c=p)}return s||(s=n[n.length-1]),s.from<a&&(s={from:a,to:s.to,level:s.level}),s.to>d&&(s={from:s.from,to:d,level:s.level}),s}export function textHeight(e){if(null!=e.cachedTextHeight)return e.cachedTextHeight;if(null==measureText){measureText=elt("pre",null,"CodeMirror-line-like");for(let e=0;e<49;++e)measureText.appendChild(document.createTextNode("x")),measureText.appendChild(elt("br"));measureText.appendChild(document.createTextNode("x"))}removeChildrenAndAdd(e.measure,measureText);let t=measureText.offsetHeight/50;return t>3&&(e.cachedTextHeight=t),removeChildren(e.measure),t||1}export function charWidth(e){if(null!=e.cachedCharWidth)return e.cachedCharWidth;let t=elt("span","xxxxxxxxxx"),r=elt("pre",[t],"CodeMirror-line-like");removeChildrenAndAdd(e.measure,r);let i=t.getBoundingClientRect(),n=(i.right-i.left)/10;return n>2&&(e.cachedCharWidth=n),n||10}export function getDimensions(e){let t=e.display,r={},i={},n=t.gutters.clientLeft;for(let o=t.gutters.firstChild,l=0;o;o=o.nextSibling,++l){let t=e.display.gutterSpecs[l].className;r[t]=o.offsetLeft+o.clientLeft+n,i[t]=o.clientWidth}return{fixedPos:compensateForHScroll(t),gutterTotalWidth:t.gutters.offsetWidth,gutterLeft:r,gutterWidth:i,wrapperWidth:t.wrapper.clientWidth}}export function compensateForHScroll(e){return e.scroller.getBoundingClientRect().left-e.sizer.getBoundingClientRect().left}export function estimateHeight(e){let t=textHeight(e.display),r=e.options.lineWrapping,i=r&&Math.max(5,e.display.scroller.clientWidth/charWidth(e.display)-3);return n=>{if(lineIsHidden(e.doc,n))return 0;let o=0;if(n.widgets)for(let e=0;e<n.widgets.length;e++)n.widgets[e].height&&(o+=n.widgets[e].height);return r?o+(Math.ceil(n.text.length/i)||1)*t:o+t}}export function estimateLineHeights(e){let t=e.doc,r=estimateHeight(e);t.iter((e=>{let t=r(e);t!=e.height&&updateLineHeight(e,t)}))}export function posFromMouse(e,t,r,i){let n=e.display;if(!r&&"true"==e_target(t).getAttribute("cm-not-content"))return null;let o,l,a=n.lineSpace.getBoundingClientRect();try{o=t.clientX-a.left,l=t.clientY-a.top}catch(t){return null}let d,s=coordsChar(e,o,l);if(i&&s.xRel>0&&(d=getLine(e.doc,s.line).text).length==s.ch){let t=countColumn(d,d.length,e.options.tabSize)-d.length;s=Pos(s.line,Math.max(0,Math.round((o-paddingH(e.display).left)/charWidth(e.display))-t))}return s}export function findViewIndex(e,t){if(t>=e.display.viewTo)return null;if((t-=e.display.viewFrom)<0)return null;let r=e.display.view;for(let e=0;e<r.length;e++)if((t-=r[e].size)<0)return e}