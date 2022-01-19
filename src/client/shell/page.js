import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { appState, AlertDialog } from '@app/services';
import { _, classNames } from '@app/helpers';
import { useParentPath } from './helpers';
import { useAppContext, useResources } from '@app/providers';
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
function getRequest(ref) {
  return ref.current?.getConfig()?.entity;
}
Page.propTypes = {
  Comp: PropTypes.any,
  def: PropTypes.object,
  config: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
  types: PropTypes.array,
  workflowConfig: PropTypes.object,
};
export default function Page({
  Comp,
  def,
  config,
  guards,
  workflowConfig,
}) {
  const { nav } = appState,
    loc = useLocation(),
    providedContext = useAppContext(),
    { key = '', dataQuery = [] } = def,
    ref = useRef(null),
    localParams = useParams(),
    navs = nav.get(),
    localNav = navs[key],
    //params are merged between url params and those cached
    pageParams = composeVars(localNav, localParams),
    parentRoute = useParentPath(def?.fullRoute || def?.route),
    { dataResource, getTypeMeta, loadData } = useResources(
      dataQuery,
      pageParams
    ),
    navigate = useNavigate(),
    onChange = (msg, change) => {
      const { op, value, resource } = msg;
      if (passThrough.includes(op)) {
        nav.dispatch({ path: [key, resource], value });
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
    [ctx, setCtx] = useState(() => {
      return {
        ...providedContext,
        nav,
        onChange,
        schema: providedContext.types,
        lookups: _.toObject(providedContext.lookups || []),
      };
    });
  if (!ctx.user)
    throw new Error(
      `Not logged user trying to access page '${key}.'`
    );
  const authed =
      ctx.company.allowedPages.some((p) => key.startsWith(p)) &&
      ctx.user.authorized(guards?.[key]),
    [current, setCurrent] = useState(),
    pageChanged = current?.key === key,
    dataRequest = async (req = {}) => {
      const data = await loadData(req, pageParams);
      if (data?.code) {
        navigate('/error', {
          state: { ...data, path: '/' },
        });
      } else return data;
    },
    [block, setBlock] = useState(false),
    blocker = useCallback((blocking) => {
      useEffect(() => {
        setBlock(blocking);
      }, [blocking]);
    }, []);

  useEffect(() => {
    const sub = nav.subscribe((globs) => {
      setCtx({
        ...ctx,
        globals: globs,
      });
    });
    return () => nav.unsubscribe(sub);
  }, []);

  useEffect(async () => {
    nav.dispatch({ path: 'currentPage', value: key });
    ctx.currentPage = { key, pathname: loc.pathname, pageParams };
    const req = getRequest(ref);
    if (req) {
      ctx.valueTypes = req?.type
        ? [req.type]
        : (_.isArray(req) ? req : Object.values(req) || []).map(
            (e) => e.type
          );
      const [data, meta] = await Promise.all([
        dataRequest(req),
        getTypeMeta(ctx.valueTypes),
      ]);
      ctx.lookups = meta.lookups;
      ctx.schema = meta.types;
      setCurrent({ key, model: data });
    } else setCurrent({ key });
  }, [key]);

  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: pageChanged,
      })}>
      <AlertDialog isBlocking={block} />
      <Comp
        ref={ref}
        ctx={ctx}
        config={config}
        model={pageChanged ? current?.model : undefined}
        def={def}
        params={pageParams}
        parentRoute={parentRoute}
        workflowConfig={workflowConfig}
        blocker={blocker}
      />
      {!pageChanged && (
        <h2 className="fill-in">Fetching data, please wait...</h2>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={err} />
  );
}
