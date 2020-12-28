import { host, apiPort, apiEndpoint } from '../../appConfig';
import { ctx } from '../contextProvider';

const { Logger } = ctx,
  baseUrl = `http://${host || 'localhost'}:${apiPort || 8080}/${apiEndpoint}`;

function query(params) {
  return Object.keys(params)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

const request = {
  get: (path, params, options = {}) => {
    const url = params
      ? `${options.baseUrl || baseUrl}/${path}?${query(params)}`
      : `${options.baseUrl || baseUrl}/${path}`;

    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }) //, headers , body
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        Logger.error(err.message);
      });
  },
  delete: (path, id, options = {}) => {
    const url = `${options.baseUrl || baseUrl}/${path}/${id}`;
    return fetch(url, { method: 'DELETE', mode: 'cors' }) //, headers , body, headers: {"Content-type": "application/json; charset=UTF-8"}
      .then((res) => res.json())
      .catch((err) => {
        Logger.error(err.message);
      });
  },
  post: (path, params = {}, options = {}) => {
    const url = `${options.baseUrl || baseUrl}/${path}`,
      body = JSON.stringify(params),
      headers = new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
      });

    return fetch(url, { method: 'POST', mode: 'cors', headers, body })
      .then((res) => {
        return options.type === 'pdf' || options.type === 'xlsx'
          ? res.blob()
          : res.json();
      })
      .catch((err) => {
        Logger.error(err.message);
        return err;
      });
  },
  put: (path, params = {}, options = {}) => {
    const url = `${options.baseUrl || baseUrl}/${path}`,
      body = JSON.stringify(params);

    return fetch(url, {
      method: 'PUT',
      mode: 'cors',
      body,
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        Logger.error(err.message);
        return err;
      });
  },
};

export { request };
