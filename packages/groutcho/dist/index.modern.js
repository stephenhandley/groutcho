import t from"type-of-is";import r from"url";import e from"querystring";import{pathToRegexp as s,compile as i}from"path-to-regexp";class n{constructor({input:t,route:r=null,url:e=null,params:s={},redirect:i=!1}){this.input=t,this.route=r,this.params=s,this.redirect=i,this.original=null,this.url=e||r.buildUrl(s)}isRedirect({original:t}){this.redirect=!0,this.original=t}}function o({name:t,value:r}){try{return decodeURIComponent(r)}catch(r){throw new Error("Invalid value for "+t)}}class a{constructor(t){const r=["name","pattern","page"];for(const e of r)if(!(e in t))throw new Error("Missing route param "+e);for(const[r,e]of Object.entries(t)){if(["match","buildUrl"].includes(r))throw new Error("Invalid route param "+r);this[r]=e}this._param_keys=[],this._matcher=s(this.pattern,this._param_keys,{sensitive:!1,strict:!1,end:!0})}match(t){return this["_match"+(t.url?"Url":"Route")](t)}is(t){return-1!==t.indexOf("/")?!!this._matcher.exec(t):this.name===t}_matchUrl(t){const{url:e}=t,{query:s,pathname:i}=r.parse(e,!0),o=this._matcher.exec(i);if(!o)return!1;const a={...this._getParamsFromMatch(o),...s};return new n({route:this,input:t,params:a})}_matchRoute(t){const{route:r}=t,{name:e,params:s={}}=r;return e===this.name&&!!this._requiredParamNames().every(t=>t in s)&&new n({input:t,route:this,params:s})}_getParamsFromMatch(t){const r={},e=this._paramNames();for(let s=0;s<e.length;s++){const{name:e,repeat:i,delimiter:n,optional:a}=this._param_keys[s],u=t[s+1],c=void 0!==u;let h=c?o({name:e,value:u}):u;i&&(h=h.split(n)),!c&&a||(r[e]=h)}return r}buildUrl(t={}){let r=this._buildPath(t);const e=this._buildQuery(t);return e.length&&(r=`${r}?${e}`),r}_buildPath(t){const{pattern:r}=this;return i(r)(t)}_buildQuery(t){const r=this._paramNames(),s={};for(const[e,i]of Object.entries(t))r.includes(e)||(s[e]=i);return e.stringify(s)}_paramNames(){return this._param_keys.map(t=>t.name)}_requiredParamNames(){return this._param_keys.filter(t=>!t.optional).map(t=>t.name)}}class u{constructor({routes:t,redirects:r,max_redirects:e=10}){this.routes=[],this.addRoutes(t),this.max_redirects=e,this.redirects=[];for(const[t,e]of Object.entries(r))this.redirects.push({name:t,test:e});this.listeners=[]}addRoutes(t){const r=Object.entries(t);for(const[t,e]of r){e.name=t;const r=new a(e);this.routes.push(r)}}getRoute(t){return this.routes.find(r=>Object.entries(t).every(([t,e])=>r[t]===e))}getRouteByName(t){const r=this.getRoute({name:t});if(!r)throw new Error("No route named "+t);return r}match(t){const r=this._match(t),e=this._checkRedirects({original:r});return e?(e.isRedirect({original:r}),e):r}_match(r){r=(()=>{switch(t(r)){case String:return-1!==r.indexOf("/")?{url:r}:{route:{name:r}};case Object:return r.name?{route:r}:r;default:throw new Error("Invalid input passed to _match")}})();const{url:e}=r;if(e&&e.match(/^https?:\/\//))return new n({redirect:!0,input:r,url:e});let s=null;for(const t of this.routes)if(s=t.match(r),s)break;return s}_checkRedirects({original:t,previous:r=null,current:e=null,num_redirects:s=0,history:i=[]}){const{max_redirects:n}=this;if(s>=n)throw new Error(`Number of redirects exceeded max_redirects (${n})`);if(e&&r){const t=e.route===r.route,s=function(t,r){const{stringify:e}=JSON;return e(t)===e(r)}(e.params,r.params);if(t&&s)return r}if(e||(e=t,i=[t]),e.redirect)return e;let o=!1;if(e&&e.route.redirect&&(o=e.route.redirect(e)),!o)for(const{test:t}of this.redirects)if(o=t(e),o)break;if(o){if(r=e,!(e=this._match(o)))throw new Error("No match for redirect result "+o);return i.push(e),s++,this._checkRedirects({original:t,previous:r,current:e,num_redirects:s,history:i})}return s>0&&e}onChange(t){this.listeners.push(t)}go(t){const r=this.match(t),{url:e}=r;for(const t of this.listeners)t(e)}}export{n as MatchResult,a as Route,u as Router};
//# sourceMappingURL=index.modern.js.map