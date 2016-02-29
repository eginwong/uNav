/*!CK:1082660220!*//*1456173401,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["0N39Q"]); }

/**
 * @generated SignedSource<<623c7cbcff19956af736c3d064fc689d>>
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !! This file is a check-in of a static_upstream project!      !!
 * !!                                                            !!
 * !! You should not modify this file directly. Instead:         !!
 * !! 1) Use `fjs use-upstream` to temporarily replace this with !!
 * !!    the latest version from upstream.                       !!
 * !! 2) Make your changes, test them, etc.                      !!
 * !! 3) Use `fjs push-upstream` to copy your changes back to    !!
 * !!    static_upstream.                                        !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * Copyright (C) 2010 by Johannes Baagoe <baagoe@baagoe.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @providesModule Alea
 * @preserve-header
 */__d('Alea',[],function a(b,c,d,e,f,g){if(c.__markCompiled)c.__markCompiled();function h(){var j=4022871197,k=function(l){l=l.toString();for(var m=0;m<l.length;m++){j+=l.charCodeAt(m);var o=.02519603282416938*j;j=o>>>0;o-=j;o*=j;j=o>>>0;o-=j;j+=o*4294967296;}return (j>>>0)*2.3283064365386963e-10;};k.version='Mash 0.9';return k;}function i(){return function(j){var k=0,l=0,m=0,n=1;if(j.length===0)j=[new Date()];var o=new h();k=o(' ');l=o(' ');m=o(' ');for(var p=0;p<j.length;p++){k-=o(j[p]);if(k<0)k+=1;l-=o(j[p]);if(l<0)l+=1;m-=o(j[p]);if(m<0)m+=1;}o=null;var q=function(){var r=2091639*k+n*2.3283064365386963e-10;k=l;l=m;m=r-(n=r|0);return m;};q.version='Alea 0.9';q.args=j;return q;}(Array.prototype.slice.call(arguments));}f.exports=i;},null);
__d('Random',['Alea','ServerNonce'],function a(b,c,d,e,f,g,h){'use strict';if(c.__markCompiled)c.__markCompiled();var i=4294967296,j=c('ServerNonce').ServerNonce,k=h(j),l={random:function(){if(typeof window!=='undefined'&&typeof Uint32Array!=='undefined'){var m=new Uint32Array(1);if(window.crypto&&window.crypto.getRandomValues){return window.crypto.getRandomValues(m)[0]/i;}else if(window.msCrypto&&window.msCrypto.getRandomValues)return window.msCrypto.getRandomValues(m)[0]/i;}return k();},uint32:function(){return Math.floor(this.random()*i);}};f.exports=l;},null);
__d('UFIOrderingModeSelector.react',['BanzaiLogger','InlineBlock.react','Link.react','React','Image.react','Random','ReactXUIMenu','PopoverMenu.react','UFIConfig','cx','ix'],function a(b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){if(c.__markCompiled)c.__markCompiled();var s=k.PropTypes,t=n.SelectableMenu,u=n.SelectableItem,v=k.createClass({displayName:'UFIOrderingModeSelector',propTypes:{onOrderChanged:s.func,feedback:s.shape({orderingmodes:s.array.isRequired,commentstargetfbid:s.string.isRequired,ownerid:s.string.isRequired}).isRequired},getInitialState:function(){var w=null;this.props.feedback.orderingmodes.map(function(x){if(x.selected)w=x;});return {selectedMode:w};},onMenuItemClick:function(w,x){var y=x.item.getValue();if(this.props.feedback.orderingmodes&&p.logChangeOrderingModeUsageSampleRate>m.random())h.log('CommentsOrderingModeSelectorUsageLoggerConfig',{start_order:this.state.selectedMode.value,end_order:y,post_fbid:this.props.feedback.commentstargetfbid,post_owner_fbid:this.props.feedback.ownerid,available_orders:this.props.feedback.orderingmodes.map(function(z){return z.value;})});this.props.feedback.orderingmodes.map(function(z){if(z.value===y)this.setState({selectedMode:z});}.bind(this));this.props.onOrderChanged(y);},render:function(){var w=k.createElement(t,{className:"_4tju",onItemClick:this.onMenuItemClick},this.props.feedback.orderingmodes.map(function(x){return (k.createElement(u,{key:x.value,value:x.value,label:x.name,selected:x.value===this.state.selectedMode.value},k.createElement('div',{className:"_3scm"},k.createElement('div',{className:"_3scn"},x.name),k.createElement('div',{className:"_3sco"},x.description))));}.bind(this)));return (k.createElement('div',{className:"_3scp"},k.createElement(i,null,k.createElement(o,{className:"_3scs",menu:w,alignh:'right'},k.createElement(j,null,this.state.selectedMode.name,k.createElement(l,{className:"_3sct",src:r('/images/ui/xhp/link/more/down_caret.gif')}))))));}});f.exports=v;},null);