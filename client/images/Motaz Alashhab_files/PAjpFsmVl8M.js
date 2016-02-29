/*!CK:2794269279!*//*1456168466,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["AaXt9"]); }

__d('legacy:Style',['Style'],function a(b,c,d,e,f,g){if(c.__markCompiled)c.__markCompiled();b.Style=c('Style');},3);
__d('PhotoViewerInitPagelet',['ge','DOM','PhotoSnowlift','PhotoTags','PhotoTagger','PhotoTagApproval'],function a(b,c,d,e,f,g,h,i,j,k,l,m){if(c.__markCompiled)c.__markCompiled();function n(o){'use strict';j.attachTagger(o.tagging,o.tokenizer);var p=j.getInstance(),q=p.getRoot();new k([h('fbPhotoSnowliftAuthorName'),i.find(q,'span.fbPhotoTagList')],h('fbPhotoSnowliftTagBoxes'),o.version);if(o.setupPhotoTagger){var r=new l(p);r.initSnowlift(o.tagging,o.tokenizer,o.userId);r.setQueueName(o.queueName);}new m(p);}f.exports=n;},null);