import { useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { classNames } from '@app/helpers';
import AppShell from '@app/shell/appShell';
import { Dialog, Toaster } from '@app/shell/notifications';
import * as Content from '@app/content';
import appTypes from '@app/appData/appTypes.json';
import { Page, TabbedPage, Error, NotFound } from '@app/shell';
import Home from '@app/static/home';
import Header from '@app/static/header';
import Impersonate from '@app/static/impersonate';
import './App.css';

const toRoute = (e, config) => {
  const { route, items, comp, params } = e,
    { guards, id } = config,
    path = params ? [route, ...params].join('/:') : route;

  return (
    <Route
      key={route}
      path={path}
      animate={true}
      element={
        items ? (
          <TabbedPage def={e} guards={guards} root={id} />
        ) : (
          <Page
            Comp={Content[comp]}
            def={e}
            types={appTypes[e.key]}
            guards={guards}
            root={id}
          />
        )
      }>
      {items && items.map((t) => toRoute(t, config))}
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
  store: PropTypes.object,
  Tools: PropTypes.any,
  appConfig: PropTypes.object,
  notifier: PropTypes.object,
};

export default function App({ appConfig, store, notifier }) {
  const [dialogData, setDialogData] = useState(Object.create(null)),
    { app } = appConfig.staticPages;

  notifier.dialog = async function (data) {
    return new Promise((resolve) => {
      const report = (res) => {
        setDialogData(Object.create(null));
        resolve(res);
      };
      setDialogData({ ...data, report });
    });
  };

  return (
    <BrowserRouter>
      <Toaster store={store} ttl={10000} />
      <div className="modal-root"></div>
      <Dialog {...dialogData} />
      <header id="header" className="app-header">
        <Header config={appConfig} />
      </header>
      <aside id="sidenav" className="app-sidenav" />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Wrapped>
                <Home config={appConfig} store={store} />
              </Wrapped>
            }
            animate={true}
          />
          <Route
            path={app.path}
            element={
              <Wrapped app>
                <AppShell config={appConfig} store={store} />
              </Wrapped>
            }>
            {appConfig.routes.map((r) => toRoute(r, appConfig))}
          </Route>
          <Route
            path="impersonate"
            element={
              <Wrapped>
                <Impersonate config={appConfig} store={store} />
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
    </BrowserRouter>
  );
}
