import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import { NAV, SESSION } from '@app/constants';
import { classNames } from '@app/helpers';
import { authorized } from './helpers'; //, relativePath
import { useAppContext } from '@app/providers/contextProvider';
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
};
export default function Page({ Comp, def, guards }) {
  //, root
  const { key, lookups, dataQuery = [] } = def,
    { store, useResources, notifier } = useAppContext(),
    { user } = store.getState(SESSION),
    authed = authorized(user, guards?.[key]),
    nav = store.getState(NAV),
    { uom, locale, currentPage } = nav,
    { loaded, retrieve, dataResource } = useResources(dataQuery),
    navigate = useNavigate(),
    onChange = (msg) => {
      if (!msg) return;
      const { src, ...rest } = msg;
      if (rest.op === 'ui') {
        store.dispatch(NAV, { value: { [key]: msg.value } });
      } else if (rest.op === 'options') {
        var vars = {
          [src]: rest.value,
        };
        dataRequest(vars);
      } else {
        //remove - remove item from server data, stay on page
        //add,edit - navigate to item page with value as slug (add: new), and there getentity from server (if slug is not 'new')
        dataResource.processChange(src, rest);
        setModel(dataResource.data);
      }
    },
    ctx = useRef({
      roles: user?.roles,
      nav: { uom, locale, state: nav[currentPage] },
      onChange,
    }),
    [model, setModel] = useState(),
    ready = !!model,
    dataRequest = async (vars) => {
      const info = await dataResource.fetch(vars);
      if (info.code) {
        navigate('/error', {
          state: { ...info, path: '/' },
        });
      } else {
        setModel(dataResource.data);
      }
      //run request ctx.current.dataResource;
      //setModel(model)
      //{ options }, id
      // const query = dataQuery.find((q) => q.name === id);
      // query &&
      //   Object.assign(query.vars.options, {
      //     skip: options.size * (options.page - 1),
      //     limit: options.size,
      //   });
    };
  ///HACKING - need to define page queries based on url (id, etc.)
  var qr =
    dataQuery.length > 0
      ? { [dataQuery[0].name]: { id: '123', options: { skip: 11 } } }
      : undefined;
  useEffect(async () => {
    // var rrt = await notifier.dialog({
    //   title: 'hello',
    //   text: 'hello',
    //   okText: 'Accept',
    // });
    // console.log(rrt);
    store.dispatch(NAV, { path: 'currentPage', value: key });
    const res = await retrieve(lookups, key);
    Object.assign(ctx.current, res);
    dataRequest(qr);
  }, []);
  //relativePath(root)
  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: ready,
      })}>
      {loaded && ready ? (
        <Comp
          store={store}
          notifier={notifier}
          ctx={ctx.current}
          model={model}
          def={def}
          dataRequest={dataRequest}
        />
      ) : (
        <div>Fetching data, please wait...</div>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={{ err }} />
  );
}
