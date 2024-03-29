import { Suspense } from 'react';
import { render } from 'react-dom';
import Logger from 'js-logger';
import App from '@app/App';
import AppContextProvider from '@app/providers/contextProvider';
import ErrorBoundary from '@app/utils/errorBoundary';
import config from '@app/appData/appConfig.json';
import cache from '@app/utils/storage';
import { store, Dialog } from '@app/services';
const { API_HOST, API_PORT, API_URI } = process.env;

Logger.useDefaults();
Logger.setLevel(Logger.WARN);
const Tools = () => <div>Tools</div>;
//  lazy(() =>
//   import(`./shell/${isDev ? 'play' : 'notFound'}`)
// )
cache.init(config.id);
store.init(cache);

render(
  <ErrorBoundary>
    <Suspense fallback={'Loading...'}>
      <AppContextProvider
        config={config}
        api_uri={`http://${API_HOST}:${API_PORT}`}
        gql={API_URI}
        logger={Logger}>
        {(ctx) => (
          <>
            <Dialog />
            <App
              Tools={Tools}
              appConfig={config}
              ctx={ctx}
              store={store}
            />
          </>
        )}
      </AppContextProvider>
    </Suspense>
  </ErrorBoundary>,
  document.getElementById('root'),
  () => {
    Logger.warn('App started... .');
  }
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(
      ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    );
  }
};

reportWebVitals();
