import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@app/shell/appShell';
import * as Content from '@app/content';
import { Page, TabbedPage, Error, NotFound } from '@app/shell';
import Home from '@app/static/home';
import Header from '@app/static/header';
import Impersonate from '@app/static/impersonate';
import Footer from '@app/shell/footer';
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
};

export default function App({ appConfig, store }) {
  return (
    <BrowserRouter>
      <header id="header" className="app-header box-shadow">
        <Header config={appConfig} />
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main className="app-docs">
              <Home config={appConfig} store={store} />
            </main>
          }
          animate={true}
        />
        <Route
          path={appConfig.rootPath}
          element={<AppShell config={appConfig} store={store} />}>
          {appConfig.routes.map((r) => toRoute(r, appConfig))}
        </Route>
        <Route
          path="impersonate"
          element={
            <main className="app-docs">
              <Impersonate config={appConfig} store={store} />
            </main>
          }
          animate={true}
        />
        <Route
          path="error"
          element={
            <main className="app-error">
              <Error />
            </main>
          }
          animate={true}
        />
        <Route
          path="*"
          element={
            <main className="app-error">
              <NotFound />
            </main>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
