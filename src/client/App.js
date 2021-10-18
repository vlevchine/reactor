import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { classNames } from '@app/helpers';
import AppShell from '@app/shell/appShell';
import { Toaster, Dialog } from '@app/services';
import Content from '@app/content';
import { Page, TabbedPage, Error, NotFound } from '@app/shell';
import Home from '@app/static/home';
import Header from '@app/static/header';
import Impersonate from '@app/static/impersonate';
import { dragManager } from '@app/components/core/dnd';
import './App.css';

const toRoute = (e, config) => {
  const { guards, key, route, tabs, comp } = e,
    { root, workflowConfig } = config; //, items, tabs

  //console.log(e);
  return (
    <Route
      key={key}
      path={route}
      animate={true}
      element={
        tabs ? (
          <TabbedPage
            def={e}
            guards={guards}
            tabs={config.routes.filter((r) => tabs.includes(r.key))}
            workflowConfig={workflowConfig}
          />
        ) : (
          <Page
            Comp={Content[comp]}
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

Wrapped.propTypes = {
  app: PropTypes.bool,
  children: PropTypes.any,
};
function Wrapped({ app, children }) {
  return (
    <div
      className={classNames(['app-content'], {
        ['content-padded']: app,
      })}>
      {children}
    </div>
  );
}
App.propTypes = {
  Tools: PropTypes.any,
  appConfig: PropTypes.object,
};

export default function App({ appConfig }) {
  const { root, routes } = appConfig; //app.;routes, staticPages
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
    dragManager.init({
      top: Math.round(box.top),
      left: Number(left),
    });
    const onScroll = () => {
      parent.style.setProperty('--shift-x', `${parent.scrollLeft}px`);
      parent.style.setProperty('--shift-y', `${parent.scrollTop}px`);
    };
    parent.addEventListener('scroll', onScroll);
    return () => parent.removeEventListener('scroll', onScroll);
  }, []);
  console.log('App');
  return (
    <BrowserRouter>
      <div className="modal-root"></div>
      <header id="header" className="app-header">
        <Header config={appConfig} />
      </header>
      {/* */}
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Wrapped>
                <Home config={appConfig} />
              </Wrapped>
            }
            animate={true}
          />
          <Route
            path={root}
            element={
              <Wrapped app>
                <AppShell
                  config={appConfig}
                  root={root}
                  dflt={routes[0].route}
                  routes={routes}
                />
              </Wrapped>
            }>
            {routes.map((r) => toRoute(r, appConfig))}
          </Route>
          <Route
            path="impersonate"
            element={
              <Wrapped>
                <Impersonate config={appConfig} />
              </Wrapped>
            }
            animate={true}
          />
          <Route
            path="error"
            element={
              <Wrapped>
                <Error />
              </Wrapped>
            }
            animate={true}
          />
          <Route
            path="*"
            element={
              <Wrapped>
                <NotFound />
              </Wrapped>
            }
          />
        </Routes>
        <footer className="app-footer box-shadow">
          <h6>Copyright Vlad Levchine © 2020-2021</h6>
        </footer>
      </main>
      <Toaster ttl={10000} />
      <Dialog />
    </BrowserRouter>
  );
}
