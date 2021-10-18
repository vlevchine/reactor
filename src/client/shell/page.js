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

const passThrough = ['ui', 'options'],
  globParams = ['locale', 'uom'];
Page.propTypes = {
  Comp: PropTypes.any,
  def: PropTypes.object,
  guards: PropTypes.object,
  root: PropTypes.string,
  types: PropTypes.array,
  workflowConfig: PropTypes.object,
};
export default function Page({ Comp, def, guards, workflowConfig }) {
  const { session, nav } = appState,
    loc = useLocation(),
    providedContext = useAppContext();
  const { key, dataQuery = [] } = def,
    authed = providedContext.user?.authorized(guards?.[key]),
    ref = useRef(null),
    parentRoute = useParentPath(def.fullRoute || def.route),
    //params are merged between url params and those cached
    localParams = useParams(),
    localNav = nav.get()[key],
    pageParams = composeVars(localNav, localParams),
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
    [model, setModel] = useState({}),
    [ctx, setCtx] = useState(() => {
      const { globals, company, users, roles } = session.get();
      return {
        company,
        users,
        roles,
        ...globals,
        nav,
        user: providedContext.user,
        lookups: _.toObject(providedContext.lookups || []),
        schema: providedContext.types,
        onChange,
      };
    }),
    dataRequest = async (req = {}) => {
      const data = await loadData(req, pageParams);
      if (data?.code) {
        navigate('/error', {
          state: { ...data, path: '/' },
        });
      } else return data;
    },
    activeModel = model?.[key];

  const [block, setBlock] = useState(false),
    blocker = useCallback((blocking) => {
      useEffect(() => {
        setBlock(blocking);
      }, [blocking]);
    }, []);

  useEffect(() => {
    const sub = session.subscribe(() => {
      const globs = _.pick(ctx, globParams),
        n_globs = session.get('globals');
      if (!_.isSame(globs, n_globs))
        setCtx({
          ...ctx,
          ...n_globs,
        });
    });

    return () => {
      session.unsubscribe(sub);
    };
  }, []);

  useEffect(async () => {
    ctx.currentPage = { key, pathname: loc.pathname, pageParams };
    const config = ref.current?.getConfig(),
      req = config?.entity;

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
      setModel({ [key]: data });
    } else setModel({});
  }, [key]);

  return authed ? (
    <section
      className={classNames(['app-page s-panel'], {
        ['active']: activeModel,
      })}>
      <AlertDialog isBlocking={block} />
      <Comp
        ref={ref}
        ctx={ctx}
        model={activeModel}
        def={def}
        params={pageParams}
        parentRoute={parentRoute}
        workflowConfig={workflowConfig}
        blocker={blocker}
      />
      {!activeModel && (
        <h2 className="fill-in">Fetching data, please wait...</h2>
      )}
    </section>
  ) : (
    <Navigate to="/error" replace state={err} />
  );
}
