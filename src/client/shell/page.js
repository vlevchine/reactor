import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom'; //,
import { appState, AlertDialog } from '@app/services';
import { _, classNames } from '@app/helpers';
import { useParentPath } from './helpers';
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
      } else acc[first] = v;
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
  workflowConfig: PropTypes.object,
};
export default function Page({ Comp, def, guards, workflowConfig }) {
  const nav = appState.nav.get(),
    session = appState.session.get(),
    loc = useLocation(),
    providedContext = useAppContext();
  const { key, dataQuery = [] } = def,
    authed = providedContext.user?.authorized(guards?.[key]),
    ref = useRef(null),
    parentRoute = useParentPath(def.fullRoute || def.route),
    //params are merged between url params and those cached
    localParams = useParams(),
    pageParams = composeVars(nav[key], localParams),
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
    [ctx, setCtx] = useState(() => ({
      ...session,
      ...session.globals,
      ...loc,
      pageParams: localParams,
      nav: appState.nav,
      user: providedContext.user,
      lookups: providedContext.lookups,
      types: providedContext.types,
      onChange,
    })),
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

  const [block, setBlock] = useState(false),
    blocker = useCallback((blocking) => {
      useEffect(() => {
        setBlock(blocking);
      }, [blocking]);
    }, []);

  useEffect(() => {
    appState.session.dispatch({ path: 'currentPage', value: key });
    const sub = appState.session.subscribe((ses) => {
      setCtx({
        ...ctx,
        ...ses.globals,
      });
    });
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
    return () => appState.session.unsubscribe(sub);
  }, [key]);

  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: model,
      })}>
      <AlertDialog isBlocking={block} />
      <Comp
        ref={ref}
        ctx={ctx}
        model={model}
        def={def}
        params={pageParams}
        parentRoute={parentRoute}
        workflowConfig={workflowConfig}
        blocker={blocker}
      />
      {!model && (
        <h2 className="fill-in">Fetching data, please wait...</h2>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={err} />
  );
}
