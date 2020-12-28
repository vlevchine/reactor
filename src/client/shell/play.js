import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { parseGraphQL } from '@appRoot/utilsParser';
import { AppContext } from '@app/contextProvider';
import Header from './header';
import { config } from '@appRoot/.playground/index';
import TabList from '@app/components/tabList';
import Icon from '@app/components/base/icon';

const { uri, items, extraSchema, user } = config,
  client = new ApolloClient({ uri });
const pages = [{ ...items[0], key: '0', path: '/' }, ...items];

const Playground = ({ brand, title, path }) => {
  const navigate = useNavigate(),
    //!!!For DevTool - overload reources(lookups and schema, i.e. common types)
    context = useContext(AppContext), //{store, cache, formProvider, config, i18n, t, Logger}
    { schema } = context, //store
    root = `\\${path}\\`,
    pageId = useLocation().pathname.substring(root.length),
    onTab = (id) => {
      const item = items.find((e) => e.id === id);
      navigate(item.id);
    };
  Object.assign(schema, parseGraphQL(extraSchema, schema));
  context.user = user;
  //lookupsMng.init('lookups_plg');
  //{ store, config } = useContext(AppContext),
  //   def = findInTree(config.app, uri, { sep: '/', prop: 'k' });
  // useEffect(() => {
  //   store.dispatch(store.topics.NAV, { uri });
  // }, [uri]);

  return (
    <>
      <Header
        brand={brand}
        title={title}
        togglerOne={
          <Link to="/app" className="app-header-link">
            <Icon name="undo" />
            <span style={{ margin: '0 1rem' }}>Back to App</span>
          </Link>
        }
        togglerTwo={
          <div style={{ marginLeft: '4rem' }}>
            <TabList tabs={items} selected={pageId} update={onTab} />
          </div>
        }
      />
      <section className="app-main" style={{ marginLeft: 0 }}>
        <ApolloProvider client={client}>
          <Routes>
            {pages.map((e) => {
              const Comp = e.component;
              return (
                <Route
                  key={e.key || e.id}
                  path={e.path || e.id}
                  animate={true}
                  element={<Comp def={e} />}
                />
              );
            })}
          </Routes>
        </ApolloProvider>
      </section>
    </>
  );
};

Playground.propTypes = {
  brand: PropTypes.string,
  title: PropTypes.string,
  path: PropTypes.string,
  config: PropTypes.object,
  className: PropTypes.string,
};

export default Playground;
