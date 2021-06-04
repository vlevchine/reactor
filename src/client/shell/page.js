import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useParams, useNavigate } from 'react-router-dom'; //,
import { NAV, SESSION } from '@app/constants';
import { classNames } from '@app/helpers';
import { authorized, useParentPath } from './helpers';
import { useAppContext } from '@app/providers/contextProvider';
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
export default function Page({ Comp, def, guards, types }) {
  const { key, dataQuery = [] } = def,
    { store } = useAppContext(),
    { user, company } = store.getState(SESSION),
    authed = authorized(user, guards?.[key]),
    nav = store.getState(NAV),
    parentRoute = useParentPath(def.fullRoute || def.route),
    //params are merged between url params and those cached
    pageParams = composeVars(nav[key], useParams()),
    { retrieve, dataResource, getLookups } = useResources(
      dataQuery,
      pageParams
    ),
    navigate = useNavigate(),
    onChange = (msg, change) => {
      //, model, change
      const { op, value, resource } = msg;
      if (passThrough.includes(op)) {
        store.dispatch(NAV, { path: [key, resource], value });
        if (op === 'options') {
          //request data here : pager/filters
          dataRequest(resource, value).then(() => {
            setModel(dataResource.data);
          });
        }
      } else {
        const { user, company } = ctx,
          authorId = user && company && `${user.id}@${company.id}`;
        dataResource.addChange(resource, change, authorId);
      }
    },
    [model, setModel] = useState(),
    [ctx, setCtx] = useState({
      user,
      company,
      nav: { ...nav.globals, state: nav[key] },
      onChange,
      getLookups,
    }),
    dataRequest = async (resouce, options) => {
      const info = await dataResource.fetch(resouce, options);
      if (info?.code) {
        navigate('/error', {
          state: { ...info, path: '/' },
        });
      }
    };

  useEffect(() => {
    store.dispatch(NAV, { path: 'currentPage', value: key });
    const sub = store.subscribe(NAV, (nav) => {
      setCtx({
        ...ctx,
        nav: { ...nav.globals, state: nav[key] },
      });
    });
    retrieve(def.lookups, types)
      .then(({ lookups, schema }) => {
        Object.assign(ctx, { lookups, schema, dataResource });
      })
      .then(dataRequest)
      .then(() => {
        setModel(dataResource.data);
      });

    return () => store.unsubscribe(NAV, sub);
  }, [key]);

  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: model,
      })}>
      {model ? (
        <Comp
          store={store}
          ctx={ctx}
          model={model}
          def={def}
          pageParams={pageParams}
          parentRoute={parentRoute}
        />
      ) : (
        <div>Fetching data, please wait...</div>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={{ err }} />
  );
}
