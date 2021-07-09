import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useParams, useNavigate } from 'react-router-dom'; //,
import { appState } from '@app/services';
import { _, classNames } from '@app/helpers';
import { useParentPath } from './helpers';
import { useResources } from '@app/providers/resourceManager';
import '@app/components/core/styles.css';

const err = {
    code: 401,
    message: 'You are not authorized to view requested page',
    name: 'AuthorizationError',
  },
  composeVars = (src = {}, params) => {
    return Object.entries(params).reduce((acc, [k, v]) => {
      const [first, ...other] = k.split('_');
      if (other.length > 0) {
        if (!acc[first]) acc[first] = Object.create(null);
        acc[first][other.join('_')] = v;
      }
      return acc;
    }, src);
  };

const passThrough = ['ui', 'options'];
Page.propTypes = {
  Comp: PropTypes.any,
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
  types: PropTypes.array,
};
export default function Page({ Comp, def, guards }) {
  const { key, dataQuery = [] } = def,
    session = appState.session.get(),
    authed = session.user.authorized(guards?.[key]),
    nav = appState.nav.get(),
    ref = useRef(null),
    parentRoute = useParentPath(def.fullRoute || def.route),
    //params are merged between url params and those cached
    pageParams = composeVars(nav[key], useParams()),
    { dataResource, getTypeMeta, loadData } = useResources(
      dataQuery,
      pageParams
    ),
    navigate = useNavigate(),
    onChange = (msg, change) => {
      //, model, change
      const { op, value, resource } = msg;
      if (passThrough.includes(op)) {
        appState.nav.dispatch({ path: [key, resource], value });
        if (op === 'options') {
          //request data here : pager/filters
          dataRequest(value);
        }
      } else {
        const { user, company } = ctx,
          authorId = user && company && `${user.id}@${company.id}`;
        dataResource.addChange(resource, change, authorId);
      }
    },
    [model, setModel] = useState(),
    [ctx, setCtx] = useState({
      ...session,
      ...nav.globals,
      state: nav[key],
      onChange,
    }),
    dataRequest = async (val = {}, config) => {
      const { filter, options, sort } = val,
        params = {
          ...val,
          filter,
          sort,
          props: config?.props,
          options: Object.assign({}, config?.options, options),
        };

      const data = await loadData(config?.entity, params);
      if (data?.code) {
        navigate('/error', {
          state: { ...data, path: '/' },
        });
      } else setModel(data);
    };

  useEffect(() => {
    appState.nav.dispatch({ path: 'currentPage', value: key });
    const sub = appState.nav.subscribe((nav) => {
      setCtx({
        ...ctx,
        ...nav.globals,
        state: nav[key],
      });
    });
    ctx.lookups = {};
    const config = ref.current?.getConfig(),
      req = config?.entity;
    if (req) {
      const typeNames = req?.type
        ? [req.type]
        : (_.isArray(req) ? req : Object.values(req) || []).map(
            (e) => e.type
          );

      getTypeMeta(typeNames).then(({ lookups, types }) => {
        Object.assign(ctx, {
          lookups,
          valueTypes: typeNames,
          schema: types,
        });
        dataRequest(undefined, config);
      });
    } else setModel({});
    ctx.lookups.roles = session.roles;
    return () => appState.nav.unsubscribe(sub);
  }, [key]);

  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: model,
      })}>
      <Comp
        ref={ref}
        ctx={ctx}
        model={model}
        def={def}
        pageParams={pageParams}
        parentRoute={parentRoute}
        loadData={loadData}
      />
      {!model && (
        <h2 className="fill-in">Fetching data, please wait...</h2>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={{ err }} />
  );
}
