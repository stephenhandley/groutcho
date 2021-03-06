import Url from 'url';
import Querystring from 'querystring';
import {pathToRegexp, compile} from 'path-to-regexp';

import MatchResult from './MatchResult';

export default class Route {
  /**
   * Represents a route
   * @constructor
   * @param {string} name - Name for the route.
   * @param {string} pattern - Pattern used by path-to-regexp to match route.
   * @param {Object} page - Page to be returned along with params for this route.
   */
  constructor (params) {
    const required_params = ['name', 'pattern', 'page'];
    for (const param of required_params) {
      if (!(param in params)) {
        throw new Error(`Missing route param ${param}`);
      }
    }

    // Allow for dynamic params in routes to be used with
    // custom redirects etc.
    for (const [k, v] of Object.entries(params)) {
      if (['is', 'match', 'buildUrl'].includes(k)) {
        throw new Error(`Invalid route param ${k}`);
      }
      this[k] = v;
    }

    // create matcher for this route (uses path-to-regexp)
    const options = {
      sensitive: false,
      strict: false,
      end: true
    };
    this._param_keys = [];
    this._matcher = pathToRegexp(this.pattern, this._param_keys, options);
  }

  /**
  * Check whether this route matches a passed path or route.
  * @return {MatchedRoute}
  */
  // you can either pass a path to match
  match (args) {
    const fn_name = `_match${args.url ? 'Url' : 'Route'}`;
    return this[fn_name](args);
  }

  is (test) {
    if (test.indexOf('/') !== -1) {
      return !!this._matcher.exec(test);
    } else {
      return (this.name === test);
    }
  }

  _matchUrl (input) {
    const {url} = input;

    const {
      query: query_params,
      pathname: path
    } = Url.parse(url, true);

    const match = this._matcher.exec(path);
    if (!match) {
      return false;
    }

    const route_params = this._getParamsFromMatch(match);
    const params = {...route_params, ...query_params};

    return new MatchResult({
      route: this,
      input,
      params
    });
  }

  // matches if
  // 1) name matches
  // 2) all named params are present
  _matchRoute (input) {
    const {route} = input;
    const {name, params = {}} = route;

    // Name of passed route must match this route's name
    if (name !== this.name) {
      return false;
    }

    const param_names = this._requiredParamNames();
    const has_all_params = param_names.every((name)=> name in params);
    if (!has_all_params) {
      return false;
    }

    // All named params are present, its a match
    return new MatchResult({
      input,
      route: this,
      params
    });
  }

  _getParamsFromMatch (match) {
    const params = {};
    const param_names = this._paramNames();

    for (let i = 0; i < param_names.length; i++) {
      // TODO: worth handling delim / repeat?
      const {name, repeat, delimiter, optional} = this._param_keys[i];
      const value = match[i + 1];
      const defined = (value !== undefined);
      let decoded = defined ? decodeURIComponent(value) : value;
      if (repeat) {
        decoded = decoded.split(delimiter);
      }
      if (defined || !optional) {
        params[name] = decoded;
      }
    }

    return params;
  }

  buildUrl (params = {}) {
    let url = this._buildPath(params);
    const query = this._buildQuery(params);
    if (query.length) {
      url = `${url}?${query}`;
    }
    return url;
  }

  _buildPath (params) {
    const {pattern} = this;
    const buildPath = compile(pattern);
    return buildPath(params);
  }

  _buildQuery (params) {
    const param_names = this._paramNames();

    const query_params = {};
    for (const [name, value] of Object.entries(params)) {
      if (!param_names.includes(name)) {
        query_params[name] = value;
      }
    }

    return Querystring.stringify(query_params);
  }

  _paramNames () {
    return this._param_keys.map((k)=> k.name);
  }

  _requiredParamNames () {
    return this._param_keys
      .filter((k)=> !k.optional)
      .map((k)=> k.name);
  }
}
