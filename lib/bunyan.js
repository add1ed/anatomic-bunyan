/*
# This is the MIT license

Copyright 2016 Trent Mick
Copyright 2016 Joyent Inc.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var runtimeEnv,os,fs,dtrace,LOG_VERSION=0,xxx=function(e){var t=["XXX: "+e].concat(Array.prototype.slice.call(arguments,1));console.error.apply(this,t)},xxx=function(){};if("undefined"!=typeof process&&process.versions&&(process.versions.nw?runtimeEnv="nw":process.versions.node&&(runtimeEnv="node")),runtimeEnv||"undefined"==typeof window||window.window!==window||(runtimeEnv="browser"),!runtimeEnv)throw new Error("unknown runtime environment");if("browser"===runtimeEnv)os={hostname:function(){return window.location.host}},fs={},dtrace=null;else{os=require("os"),fs=require("fs");try{dtrace=require("dtrace-provider")}catch(e){dtrace=null}}var util=require("util"),assert=require("assert"),EventEmitter=require("events").EventEmitter,stream=require("stream");try{var safeJsonStringify=require("safe-json-stringify")}catch(e){safeJsonStringify=null}process.env.BUNYAN_TEST_NO_SAFE_JSON_STRINGIFY&&(safeJsonStringify=null);try{var mv=require("mv")}catch(e){mv=null}try{var sourceMapSupport=require("source-map-support")}catch(e){sourceMapSupport=null}function objCopy(t){if(null==t)return t;if(Array.isArray(t))return t.slice();if("object"!=typeof t)return t;var r={};return Object.keys(t).forEach(function(e){r[e]=t[e]}),r}var inspect,formatRegExp,format=util.format;function getCaller3Info(){if(void 0!==this){var o={},e=Error.stackTraceLimit,t=Error.prepareStackTrace;return Error.stackTraceLimit=3,Error.prepareStackTrace=function(e,t){var r=t[2];sourceMapSupport&&(r=sourceMapSupport.wrapCallSite(r)),o.file=r.getFileName(),o.line=r.getLineNumber();var i=r.getFunctionName();i&&(o.func=i)},Error.captureStackTrace(this,getCaller3Info),this.stack,Error.stackTraceLimit=e,Error.prepareStackTrace=t,o}}function _indent(e,t){return(t=t||"    ")+e.split(/\r?\n/g).join("\n"+t)}function _warn(e,t){if(assert.ok(e),t){if(_warned[t])return;_warned[t]=!0}process.stderr.write(e+"\n")}function _haveWarned(e){return _warned[e]}format||(inspect=util.inspect,formatRegExp=/%[sdj%]/g,format=function(e){if("string"!=typeof e){for(var t=[],r=0;r<arguments.length;r++)t.push(inspect(arguments[r]));return t.join(" ")}for(var r=1,i=arguments,o=i.length,s=String(e).replace(formatRegExp,function(e){if(o<=r)return e;switch(e){case"%s":return String(i[r++]);case"%d":return Number(i[r++]);case"%j":return fastAndSafeJsonStringify(i[r++]);case"%%":return"%";default:return e}}),a=i[r];r<o;a=i[++r])s+=null===a||"object"!=typeof a?" "+a:" "+inspect(a);return s});var _warned={};function ConsoleRawStream(){}ConsoleRawStream.prototype.write=function(e){e.level<INFO?console.log(e):e.level<WARN?console.info(e):e.level<ERROR?console.warn(e):console.error(e)};var TRACE=10,DEBUG=20,INFO=30,WARN=40,ERROR=50,FATAL=60,levelFromName={trace:TRACE,debug:DEBUG,info:INFO,warn:WARN,error:ERROR,fatal:FATAL},nameFromLevel={};Object.keys(levelFromName).forEach(function(e){nameFromLevel[levelFromName[e]]=e});var dtp=void 0,probes=dtrace&&{};function resolveLevel(e){var t,r=typeof e;if("string"==r){if(!(t=levelFromName[e.toLowerCase()]))throw new Error(format('unknown level name: "%s"',e))}else{if("number"!=r)throw new TypeError(format("cannot resolve level: invalid arg (%s):",r,e));if(e<0||Math.floor(e)!==e)throw new TypeError(format("level is not a positive integer: %s",e));t=e}return t}function isWritable(e){return e instanceof stream.Writable||"function"==typeof e.write}function Logger(t,e,r){if(xxx("Logger start:",t),!(this instanceof Logger))return new Logger(t,e);var i;if(void 0!==e&&(i=t,t=e,!(i instanceof Logger)))throw new TypeError("invalid Logger creation: do not pass a second arg");if(!t)throw new TypeError("options (object) is required");if(i){if(t.name)throw new TypeError("invalid options.name: child cannot set logger name")}else if(!t.name)throw new TypeError("options.name (string) is required");if(t.stream&&t.streams)throw new TypeError('cannot mix "streams" and "stream" options');if(t.streams&&!Array.isArray(t.streams))throw new TypeError("invalid options.streams: must be an array");if(t.serializers&&("object"!=typeof t.serializers||Array.isArray(t.serializers)))throw new TypeError("invalid options.serializers: must be an object");if(EventEmitter.call(this),i&&r){this._isSimpleChild=!0,this._level=i._level,this.streams=i.streams,this.serializers=i.serializers,this.src=i.src,this.tracer=i.tracer;for(var o=this.fields={},s=Object.keys(i.fields),a=0;a<s.length;a++){var n=s[a];o[n]=i.fields[n]}for(var l=Object.keys(t),a=0;a<l.length;a++){n=l[a];o[n]=t[n]}}else{var c,u=this;if(i){this._level=i._level,this.streams=[];for(a=0;a<i.streams.length;a++){var m=objCopy(i.streams[a]);m.closeOnExit=!1,this.streams.push(m)}this.serializers=objCopy(i.serializers),this.src=i.src,this.tracer=i.tracer,this.fields=objCopy(i.fields),t.level&&this.level(t.level)}else this._level=Number.POSITIVE_INFINITY,this.streams=[],this.serializers=null,this.src=!1,this.fields={};if(!dtp&&dtrace){for(var f in dtp=dtrace.createDTraceProvider("bunyan"),levelFromName){probes[levelFromName[f]]=c=dtp.addProbe("log-"+f,"char *"),c.dtp=dtp}dtp.enable()}t.stream?u.addStream({type:"stream",stream:t.stream,closeOnExit:!1,level:t.level}):t.streams?t.streams.forEach(function(e){u.addStream(e,t.level)}):i&&t.level?this.level(t.level):i||("browser"===runtimeEnv?u.addStream({type:"raw",stream:new ConsoleRawStream,closeOnExit:!1,level:t.level}):u.addStream({type:"stream",stream:process.stdout,closeOnExit:!1,level:t.level})),t.serializers&&u.addSerializers(t.serializers),t.src&&(this.src=!0),t.tracer&&(this.tracer=t.tracer),xxx("Logger: ",u),delete(o=objCopy(t)).stream,delete o.level,delete o.streams,delete o.serializers,delete o.src,delete o.tracer,this.serializers&&this._applySerializers(o),o.hostname||u.fields.hostname||(o.hostname=os.hostname()),o.pid||(o.pid=process.pid),Object.keys(o).forEach(function(e){u.fields[e]=o[e]})}}function mkRecord(e,t,r){var i,o,s;r[0]instanceof Error?(o={err:e.serializers&&e.serializers.err?e.serializers.err(r[0]):Logger.stdSerializers.err(r[0])},i={err:!0},s=1===r.length?[o.err.message]:r.slice(1)):"object"!=typeof r[0]||Array.isArray(r[0])?(o=null,s=r.slice()):Buffer.isBuffer(r[0])?(o=null,(s=r.slice())[0]=util.inspect(s[0])):s=(o=r[0])&&1===r.length&&o.err&&o.err instanceof Error?[o.err.message]:r.slice(1);var a=objCopy(e.fields),n=(a.level=t,o?objCopy(o):null);return n&&(e.serializers&&e._applySerializers(n,i),Object.keys(n).forEach(function(e){a[e]=n[e]})),a.msg=format.apply(e,s),a.time||(a.time=new Date),e.src&&!a.src&&(a.src=getCaller3Info()),a.v=LOG_VERSION,a}function mkProbeArgs(e,t,r,i){return[e||t._emit(mkRecord(t,r,i),!0)]}function mkLogEmitter(s){return function(){var e,t=null;if(this._emit){if(0===arguments.length)return this._level<=s;for(var r=new Array(arguments.length),i=0;i<r.length;++i)r[i]=arguments[i];this._level<=s&&(e=mkRecord(this,s,r),t=this._emit(e)),probes&&probes[s].fire(mkProbeArgs,t,this,s,r)}else{var o;_haveWarned.unbound||(o=getCaller3Info(),_warn(format("bunyan usage error: %s:%s: attempt to log with an unbound log method: `this` is: %s",o.file,o.line,util.inspect(this)),"unbound"))}}}function getFullErrorStack(e){var t,r=e.stack||e.toString();return!e.cause||"function"!=typeof e.cause||(t=e.cause())&&(r+="\nCaused by: "+getFullErrorStack(t)),r}util.inherits(Logger,EventEmitter),Logger.prototype.addStream=function(t,e){var r=this;switch(null==e&&(e=INFO),(t=objCopy(t)).type||(t.stream?t.type="stream":t.path&&(t.type="file")),t.raw="raw"===t.type,void 0!==t.level?t.level=resolveLevel(t.level):t.level=resolveLevel(e),t.level<r._level&&(r._level=t.level),t.type){case"stream":assert.ok(isWritable(t.stream),'"stream" stream is not writable: '+util.inspect(t.stream)),t.closeOnExit||(t.closeOnExit=!1);break;case"file":void 0===t.reemitErrorEvents&&(t.reemitErrorEvents=!0),t.stream?t.closeOnExit||(t.closeOnExit=!1):(t.stream=fs.createWriteStream(t.path,{flags:"a",encoding:"utf8"}),t.closeOnExit||(t.closeOnExit=!0));break;case"rotating-file":assert.ok(!t.stream,'"rotating-file" stream should not give a "stream"'),assert.ok(t.path),assert.ok(mv,'"rotating-file" stream type is not supported: missing "mv" module'),t.stream=new RotatingFileStream(t),t.closeOnExit||(t.closeOnExit=!0);break;case"raw":t.closeOnExit||(t.closeOnExit=!1);break;default:throw new TypeError('unknown stream type "'+t.type+'"')}t.reemitErrorEvents&&"function"==typeof t.stream.on&&t.stream.on("error",function(e){r.emit("error",e,t)}),r.streams.push(t),delete r.haveNonRawStreams},Logger.prototype.addSerializers=function(r){var i=this;i.serializers||(i.serializers={}),Object.keys(r).forEach(function(e){var t=r[e];if("function"!=typeof t)throw new TypeError(format('invalid serializer for "%s" field: must be a function',e));i.serializers[e]=t})},Logger.prototype.child=function(e,t){return new this.constructor(this,e||{},t)},Logger.prototype.reopenFileStreams=function(){var r=this;r.streams.forEach(function(t){"file"===t.type&&(t.stream&&(t.stream.end(),t.stream.destroySoon(),delete t.stream),t.stream=fs.createWriteStream(t.path,{flags:"a",encoding:"utf8"}),t.stream.on("error",function(e){r.emit("error",e,t)}))})},Logger.prototype.level=function(e){if(void 0===e)return this._level;for(var t=resolveLevel(e),r=this.streams.length,i=0;i<r;i++)this.streams[i].level=t;this._level=t},Logger.prototype.levels=function(e,t){if(void 0===e)return assert.equal(t,void 0),this.streams.map(function(e){return e.level});var r;if("number"==typeof e){if(void 0===(r=this.streams[e]))throw new Error("invalid stream index: "+e)}else{for(var i=this.streams.length,o=0;o<i;o++){var s=this.streams[o];if(s.name===e){r=s;break}}if(!r)throw new Error(format('no stream with name "%s"',e))}if(void 0===t)return r.level;var a=resolveLevel(t);(r.level=a)<this._level&&(this._level=a)},Logger.prototype._applySerializers=function(r,e){var i=this;xxx("_applySerializers: excludeFields",e),Object.keys(this.serializers).forEach(function(t){if(!(void 0===r[t]||e&&e[t])){xxx('_applySerializers; apply to "%s" key',t);try{r[t]=i.serializers[t](r[t])}catch(e){_warn(format('bunyan: ERROR: Exception thrown from the "%s" Bunyan serializer. This should never happen. This is a bug in that serializer function.\n%s',t,e.stack||e)),r[t]=format('(Error in Bunyan log "%s" serializer broke field. See stderr for details.)',t)}}})},Logger.prototype._emit=function(e,t){var r,i;if(this.tracer&&this.tracer._tracer&&this.tracer._tracer._logInjection&&(r=this.tracer.scope().active(),this.tracer.inject(r,"log",e)),void 0===this.haveNonRawStreams)for(this.haveNonRawStreams=!1,s=0;s<this.streams.length;s++)if(!this.streams[s].raw){this.haveNonRawStreams=!0;break}if((t||this.haveNonRawStreams)&&(i=fastAndSafeJsonStringify(e)+os.EOL),t)return i;for(var o=e.level,s=0;s<this.streams.length;s++){var a=this.streams[s];a.level<=o&&(xxx('writing log rec "%s" to "%s" stream (%d <= %d): %j',e.msg,a.type,a.level,o,e),a.stream.write(a.raw?e:i))}return i},Logger.prototype.trace=mkLogEmitter(TRACE),Logger.prototype.debug=mkLogEmitter(DEBUG),Logger.prototype.info=mkLogEmitter(INFO),Logger.prototype.warn=mkLogEmitter(WARN),Logger.prototype.error=mkLogEmitter(ERROR),Logger.prototype.fatal=mkLogEmitter(FATAL),Logger.stdSerializers={},Logger.stdSerializers.req=function(e){return e&&e.connection?{method:e.method,url:e.originalUrl||e.url,headers:e.headers,remoteAddress:e.connection.remoteAddress,remotePort:e.connection.remotePort}:e},Logger.stdSerializers.res=function(e){return e&&e.statusCode?{statusCode:e.statusCode,header:e._header}:e};var errSerializer=Logger.stdSerializers.err=function(e){return e&&e.stack?{message:e.message,name:e.name,stack:getFullErrorStack(e),code:e.code,signal:e.signal}:e};function safeCyclesSet(){var r=new Set;return function(e,t){return t&&"object"==typeof t?r.has(t)?"[Circular]":(r.add(t),t):t}}function safeCyclesArray(){var r=[];return function(e,t){return t&&"object"==typeof t?-1!==r.indexOf(t)?"[Circular]":(r.push(t),t):t}}var safeCycles="undefined"!=typeof Set?safeCyclesSet:safeCyclesArray;function fastAndSafeJsonStringify(t){try{return JSON.stringify(t)}catch(e){try{return JSON.stringify(t,safeCycles())}catch(e){if(safeJsonStringify)return safeJsonStringify(t);var r=e.stack.split(/\n/g,3).join("\n");return _warn('bunyan: ERROR: Exception in `JSON.stringify(rec)`. You can install the "safe-json-stringify" module to have Bunyan fallback to safer stringification. Record:\n'+_indent(format("%s\n%s",util.inspect(t),e.stack)),r),format("(Exception in JSON.stringify(rec): %j. See stderr for details.)",e.message)}}}var RotatingFileStream=null;function RingBuffer(e){this.limit=e&&e.limit?e.limit:100,this.writable=!0,this.records=[],EventEmitter.call(this)}mv&&(RotatingFileStream=function(e){if(this.path=e.path,this.count=null==e.count?10:e.count,assert.equal(typeof this.count,"number",format('rotating-file stream "count" is not a number: %j (%s) in %j',this.count,typeof this.count,this)),assert.ok(0<=this.count,format('rotating-file stream "count" is not >= 0: %j in %j',this.count,this)),e.period){var t={hourly:"1h",daily:"1d",weekly:"1w",monthly:"1m",yearly:"1y"}[e.period]||e.period,r=/^([1-9][0-9]*)([hdwmy]|ms)$/.exec(t);if(!r)throw new Error(format('invalid period: "%s"',e.period));this.periodNum=Number(r[1]),this.periodScope=r[2]}else this.periodNum=1,this.periodScope="d";var i=null;try{i=fs.statSync(this.path).mtime.getTime()}catch(e){}var o=!1;i&&i<this._calcRotTime(0)&&(o=!0),this.stream=fs.createWriteStream(this.path,{flags:"a",encoding:"utf8"}),this.rotQueue=[],this.rotating=!1,o?(this._debug("rotateAfterOpen -> call rotate()"),this.rotate()):this._setupNextRot()},util.inherits(RotatingFileStream,EventEmitter),RotatingFileStream.prototype._debug=function(){return!1},RotatingFileStream.prototype._setupNextRot=function(){this.rotAt=this._calcRotTime(1),this._setRotationTimer()},RotatingFileStream.prototype._setRotationTimer=function(){var e=this,t=this.rotAt-Date.now();2147483647<t&&(t=2147483647),this.timeout=setTimeout(function(){e._debug("_setRotationTimer timeout -> call rotate()"),e.rotate()},t),"function"==typeof this.timeout.unref&&this.timeout.unref()},RotatingFileStream.prototype._calcRotTime=function(e){this._debug("_calcRotTime: %s%s",this.periodNum,this.periodScope);var t,r=new Date;switch(this._debug("  now local: %s",r),this._debug("    now utc: %s",r.toISOString()),this.periodScope){case"ms":o=this.rotAt?this.rotAt+this.periodNum*e:Date.now()+this.periodNum*e;break;case"h":o=this.rotAt?this.rotAt+60*this.periodNum*60*1e3*e:Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),r.getUTCDate(),r.getUTCHours()+e);break;case"d":o=this.rotAt?this.rotAt+24*this.periodNum*60*60*1e3*e:Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),r.getUTCDate()+e);break;case"w":var i,o=this.rotAt?this.rotAt+7*this.periodNum*24*60*60*1e3*e:(i=7-r.getUTCDay(),e<1&&(i=-r.getUTCDay()),(1<e||e<-1)&&(i+=7*e),Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),r.getUTCDate()+i));break;case"m":o=this.rotAt?Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+this.periodNum*e,1):Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+e,1);break;case"y":o=this.rotAt?Date.UTC(r.getUTCFullYear()+this.periodNum*e,0,1):Date.UTC(r.getUTCFullYear()+e,0,1);break;default:assert.fail(format('invalid period scope: "%s"',this.periodScope))}return this._debug()&&(this._debug("  **rotAt**: %s (utc: %s)",o,new Date(o).toUTCString()),t=Date.now(),this._debug("        now: %s (%sms == %smin == %sh to go)",t,o-t,(o-t)/1e3/60,(o-t)/1e3/60/60)),o},RotatingFileStream.prototype.rotate=function(){var o=this;if(o.rotAt&&o.rotAt>Date.now())return o._setRotationTimer();if(this._debug("rotate"),o.rotating)throw new TypeError("cannot start a rotation when already rotating");function s(){o._debug("  open %s",o.path),o.stream=fs.createWriteStream(o.path,{flags:"a",encoding:"utf8"});for(var e=o.rotQueue,t=e.length,r=0;r<t;r++)o.stream.write(e[r]);o.rotQueue=[],o.rotating=!1,o.emit("drain"),o._setupNextRot()}o.rotating=!0,o.stream.end();var e,a=this.count;e=o.path+"."+String(a-1),0===a&&(e=o.path),--a,o._debug("  rm %s",e),fs.unlink(e,function(e){!function t(){if(0===o.count||a<0)return s();var r=o.path;var i=o.path+"."+String(a);0<a&&(r+="."+String(a-1));--a;fs.exists(r,function(e){e?(o._debug("  mv %s %s",r,i),mv(r,i,function(e){e?(o.emit("error",e),s()):t()})):t()})}()})},RotatingFileStream.prototype.write=function(e){return this.rotating?(this.rotQueue.push(e),!1):this.stream.write(e)},RotatingFileStream.prototype.end=function(){this.stream.end()},RotatingFileStream.prototype.destroy=function(){this.stream.destroy()},RotatingFileStream.prototype.destroySoon=function(){this.stream.destroySoon()}),util.inherits(RingBuffer,EventEmitter),RingBuffer.prototype.write=function(e){if(!this.writable)throw new Error("RingBuffer has been ended already");return this.records.push(e),this.records.length>this.limit&&this.records.shift(),!0},RingBuffer.prototype.end=function(){0<arguments.length&&this.write.apply(this,Array.prototype.slice.call(arguments)),this.writable=!1},RingBuffer.prototype.destroy=function(){this.writable=!1,this.emit("close")},RingBuffer.prototype.destroySoon=function(){this.destroy()},module.exports=Logger,module.exports.TRACE=TRACE,module.exports.DEBUG=DEBUG,module.exports.INFO=INFO,module.exports.WARN=WARN,module.exports.ERROR=ERROR,module.exports.FATAL=FATAL,module.exports.resolveLevel=resolveLevel,module.exports.levelFromName=levelFromName,module.exports.nameFromLevel=nameFromLevel,module.exports.VERSION=require("../package.json").version,module.exports.LOG_VERSION=LOG_VERSION,module.exports.createLogger=function(e){return new Logger(e)},module.exports.RingBuffer=RingBuffer,module.exports.RotatingFileStream=RotatingFileStream,module.exports.safeCycles=safeCycles;