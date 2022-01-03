import { useLayoutEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AppShell from '@app/shell/appShell';
import Content from '@app/content';
import { Page, TabbedPage } from '@app/shell';
import {
  Brand,
  Header,
  Home,
  Error,
  NotFound,
  Impersonate,
} from '@app/static';
import { dragManager } from '@app/components/core/dnd';
import './App.css';

const toRoute = (e, config) => {
  const { key, route, tabs, params, comp } = e,
    Comp = Content[comp],
    { root, routes, workflowConfig, guards } = config,
    rout = params
      ? [route, ...params.map((p) => `:${p}`)].join('/')
      : route; //, items, tabs

  return (
    <Route
      key={key}
      path={rout}
      animate={true}
      element={
        tabs ? (
          <TabbedPage
            def={e}
            guards={guards}
            tabs={routes.filter((r) => tabs.includes(r.key))}
            workflowConfig={workflowConfig}
          />
        ) : (
          <Page
            Comp={Comp}
            def={e}
            guards={guards}
            root={root}
            workflowConfig={workflowConfig}
          />
        )
      }>
      {/* {items && items.map((t) => toRoute(t, config))} */}
    </Route>
  );
};

App.propTypes = {
  Tools: PropTypes.any,
  appConfig: PropTypes.object,
  ctx: PropTypes.object,
};

export default function App({ appConfig, ctx }) {
  const { root, routes, guards } = appConfig,
    { user, company } = ctx,
    guardedRoutes = useMemo(() => {
      return filterMenu(routes, guards, company?.allowedPages, user);
    }, [user]);
  //Since header and aside are positioned fixed, main area
  //where dnd is being used must be shifted
  useLayoutEffect(() => {
    const parent = document.querySelector('.app-content'),
      box = parent?.getBoundingClientRect(),
      left =
        parent &&
        window
          .getComputedStyle(parent)
          ?.['padding-left']?.replace('px', '');
    box &&
      dragManager.init({
        top: Math.round(box.top),
        left: Number(left),
      });
    const onScroll = () => {
      parent.style.setProperty('--shift-x', `${parent.scrollLeft}px`);
      parent.style.setProperty('--shift-y', `${parent.scrollTop}px`);
    };
    parent?.addEventListener('scroll', onScroll);
    return () => {
      parent.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="modal-root"></div>
      <footer className="app-footer">
        <h6>Copyright Vlad Levchine © 2020-2021</h6>
      </footer>
      <header className="app-header">
        <Header config={appConfig} ctx={ctx} />
      </header>
      <Routes>
        <Route path="/" element={<Home config={appConfig} />} />
        <Route
          path={root}
          element={
            ctx.user ? (
              <AppShell
                config={appConfig}
                root={root}
                dflt={guardedRoutes[0].route}
                routes={guardedRoutes}
              />
            ) : (
              <Home config={appConfig} />
            )
          }>
          {guardedRoutes.map((r) => toRoute(r, appConfig))}
          <Route path="*" element={<Navigate to="/notfound" />} />
        </Route>
        <Route
          path="impersonate"
          element={
            <ProtectedPage authorized={ctx.user?.isOwner()}>
              {<Impersonate config={appConfig} ctx={ctx} />}
            </ProtectedPage>
          }
        />
        <Route path="error" element={<Error />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="/:pageName" element={<NotFound />} />
      </Routes>
      <header className="app-brand">
        <Brand config={appConfig} />
      </header>
    </BrowserRouter>
  );
}

ProtectedPage.propTypes = {
  authorized: PropTypes.bool,
  children: PropTypes.any,
};
function ProtectedPage({ authorized, children }) {
  return authorized ? (
    children
  ) : (
    <Error code="403" name="Not authorized" />
  );
}

function filterMenu(items = [], guards = [], pages = [], user) {
  let routes = items
    .filter((e) =>
      pages.some(
        (p) => e.key.startsWith(p) && user.authorized(guards[e.key])
      )
    )
    .map((e) => {
      const res = { ...e };
      if (e.tabs)
        res.tabs = e.tabs
          .filter((t) => user.authorized([e.key, t.id].join('.')))
          .map((t) => ({ ...t }));
      return res;
    });
  return routes;
}
