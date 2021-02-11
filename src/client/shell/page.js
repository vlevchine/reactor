import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import { NAV, SESSION } from '@app/constants';
import { classNames, _ } from '@app/helpers';
import { authorized, useRelativePath } from './helpers';
import { useAppContext } from '@app/providers/contextProvider';
import { useResources } from '@app/providers/resourceManager';
import '@app/components/core/styles.css';

const err = {
  code: 401,
  message: 'You are not authorized to view requested page',
  name: 'AuthorizationError',
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
    { retrieve, dataResource } = useResources(dataQuery, nav[key]),
    navigate = useNavigate(),
    onChange = (msg) => {
      if (!msg) return;
      const { src, ...rest } = msg;
      if (rest.op === 'ui') {
        store.dispatch(NAV, { value: { [key]: msg.value } });
      } else if (rest.op === 'options') {
        const conf = { [src]: rest.value };
        dataRequest(conf).then(() => setModel(dataResource.data));
        store.dispatch(NAV, { value: { [key]: conf } });
      } else {
        //remove - remove item from server data, stay on page
        //add,edit - navigate to item page with value as slug (add: new), and there getentity from server (if slug is not 'new')
        dataResource.processChange(src, rest);
        setModel(dataResource.data);
      }
    },
    [ctx, setCtx] = useState(() => ({
      roles: user?.roles,
      nav: { ...nav.globals, state: nav[key] },
      onChange,
    })),
    [model, setModel] = useState(),
    dataRequest = async (vars) => {
      const info = await dataResource.fetch(vars);
      if (info?.code) {
        navigate('/error', {
          state: { ...info, path: '/' },
        });
      }
    },
    parentRoute = useRelativePath();
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
    Promise.all([
      retrieve(def.lookups, types),
      dataRequest(dataResource.params),
    ]).then(([{ lookups, schema }]) => {
      Object.assign(ctx, { lookups, schema, dataResource });
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
          parentRoute={_.initial(parentRoute)}
        />
      ) : (
        <div>Fetching data, please wait...</div>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={{ err }} />
  );
}
