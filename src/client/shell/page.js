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

Page.propTypes = {
  Comp: PropTypes.any,
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
  types: PropTypes.array,
};
export default function Page({ Comp, def, guards, types }) {
  const { key, dataQuery = [] } = def,
    { store, notifier } = useAppContext(),
    { user } = store.getState(SESSION),
    authed = authorized(user, guards?.[key]),
    nav = store.getState(NAV),
    { retrieve, dataResource } = useResources(
      dataQuery,
      composeVars(nav[key], useParams())
    ),
    navigate = useNavigate(),
    onChange = (msg) => {
      store.dispatch(NAV, { value: { [key]: msg } });
      //const { src, op, value } = msg;
      // if (op === 'ui') {
      //   store.dispatch(NAV, { value: { [key]: value } });
      // }
    },
    [model, setModel] = useState(),
    [ctx, setCtx] = useState({
      roles: user?.roles,
      nav: { ...nav.globals, state: nav[key] },
      onChange,
    }),
    parentRoute = useParentPath(def.fullRoute || def.route),
    pageParams = composeVars(nav[key], useParams()),
    dataRequest = async () => {
      const info = await dataResource.fetch();
      if (info?.code) {
        navigate('/error', {
          state: { ...info, path: '/' },
        });
      }
    };

  // var rrt = await notifier.dialog({
  //   title: 'hello',
  //   text: 'hello',
  //   okText: 'Accept',
  // });
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
          notifier={notifier}
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
