/*!CK:2344289212!*//*1455233160,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["rMV0i"]); }

__d('ReactComposerMediaActions',['ReactComposerMediaActionType','ReactComposerDispatcher','ReactComposerMediaStore'],function a(b,c,d,e,f,g,h,i){if(c.__markCompiled)c.__markCompiled();c('ReactComposerMediaStore');j.prototype.setConfig=function(k,l){'use strict';var m={composerID:k,type:h.SET_MEDIA_CONFIG,config:l};i.dispatch(m);};j.prototype.createAlbumSelectorClicked=function(k){'use strict';i.dispatch({composerID:k,type:h.CREATE_ALBUM_SELECTOR_CLICKED});};function j(){'use strict';}f.exports=new j();},null);
__d('ReactComposerMediaAttachmentBootstrapper',['ReactComposerMediaActions','ReactComposerStatusActions','ReactComposerTaggerActions'],function a(b,c,d,e,f,g,h,i,j){if(c.__markCompiled)c.__markCompiled();var k={bootstrap:function(l,m){j.updateTaggersSource(l,m.taggersSource);i.setMentionsSource(l,m.mentionsSource);h.setConfig(l,m);}};f.exports=k;},null);