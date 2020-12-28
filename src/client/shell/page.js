import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import { NAV, AUTH } from '@app/constants';
import { classNames } from '@app/helpers';
import { authorized, relativePath } from './helpers';
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
export default function Page({ Comp, def, guards, root }) {
  const { key, lookups, dataQuery = [] } = def,
    {
      store,
      //notifier,
      useResources,
      ...rest
    } = useAppContext(),
    { user } = store.getState(AUTH),
    authed = authorized(user, guards?.[key]),
    { globals } = store.getState(NAV),
    { loaded, retrieve } = useResources(dataQuery),
    navigate = useNavigate(),
    onChange = (msg) => {
      if (!msg) return;
      //remove - remove item from server data, stay on page
      //add,edit - navigate to item page with value as slug (add: new), and there getentity from server (if slug is not 'new')
      dataResource.current.processChange(msg);
      //setModel(resources.data);
    },
    ctx = useRef({
      roles: user?.roles,
      ...globals,
      onChange,
    }),
    dataResource = useRef(),
    [ready, setReady] = useState(false),
    dataRequest = () => {
      ctx.current.model = dataResource.current.data;
      setReady(false);
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
      ? { [dataQuery[0].name]: { id: '123' } }
      : undefined;
  useEffect(async () => {
    // notifier.toast({ text: 'Page loaded!', type: 'success' });
    store.dispatch(NAV, { path: 'currentPage', value: key });
    const { dataResource, ...rest } = await retrieve(lookups, key);
    ctx.current = rest;
    dataResource.current = dataResource;
    const info = await dataResource.fetch(qr);
    if (info.code) {
      navigate('/error', {
        state: { ...info, path: '/' },
      });
    } else {
      ctx.current.model = dataResource.data;
      setReady(true);
    }

    // notifier.info({
    //   title: 'Loading ...',
    //   text: 'Loading page data, please wait ...',
    // });
  }, []);

  console.log(relativePath(root));
  console.log(user);
  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: ready,
      })}>
      {loaded && ready ? (
        <Comp
          {...rest}
          ctx={ctx.current}
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
