import { useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@app/shell/appShell';
import { Dialog, Toaster } from '@app/shell/notifications';
import * as Content from '@app/content';
import { Page, TabbedPage, Error, NotFound } from '@app/shell';
import Home from '@app/static/home';
import Header from '@app/static/header';
import Impersonate from '@app/static/impersonate';
import './App.css';

const toRoute = (e, config) => {
  const { route, items, comp } = e,
    { guards, rootPath } = config;

  return (
    <Route
      key={route}
      path={route}
      animate={true}
      element={
        items ? (
          <TabbedPage def={e} guards={guards} root={rootPath} />
        ) : (
          <Page
            Comp={Content[comp]}
            def={e}
            guards={guards}
            root={rootPath}
          />
        )
      }>
      {items && items.map((t) => toRoute(t, config))}
    </Route>
  );
};

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
            element={<Home config={appConfig} store={store} />}
            animate={true}
          />
          <Route
            path={app.path}
            element={<AppShell config={appConfig} store={store} />}>
            {appConfig.routes.map((r) => toRoute(r, appConfig))}
          </Route>
          <Route
            path="impersonate"
            element={<Impersonate config={appConfig} store={store} />}
            animate={true}
          />
          <Route path="error" element={<Error />} animate={true} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="app-footer box-shadow">
          <h6>Copyright Vlad Levchine © 2020-2021</h6>
        </footer>
      </main>
    </BrowserRouter>
  );
}
