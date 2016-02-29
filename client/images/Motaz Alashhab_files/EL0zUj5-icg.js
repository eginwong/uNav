/*!CK:2911964189!*//*1456423971,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["hV5LP"]); }

__d('TypeaheadEarlyUserRequest',['AsyncRequest','XWarmUserRequestArgsController'],function a(b,c,d,e,f,g,h,i){if(c.__markCompiled)c.__markCompiled();function j(k){'use strict';this._core=k.getCore();this._listener=null;}j.prototype.enable=function(){'use strict';this._listener=this._core.subscribe('focus',function(k,l){new h().setURI(i.getURIBuilder().getURI()).send();this.disable();}.bind(this));};j.prototype.disable=function(){'use strict';this._listener&&this._core.unsubscribe(this._listener);};f.exports=j;},null);