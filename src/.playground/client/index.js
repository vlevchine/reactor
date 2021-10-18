import React, { useContext } from 'react';
import { _ } from '@app/helpers';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { AppContext } from '@app/contextProvider';
import NavLink from '@app/components/basic/navLink';
import TabbedPages from '@app/components/tabbedPages';
import { parseGraphQL } from '@appRoot/utilsParser';
import { schema as extraSchema, user } from './_forms/sampleData';
import { tabs } from './_config';
import Config from './config';
import Browser from './browser';
import Model from './model';

const comps = { Config, Browser, Model },
  first = tabs[0],
  First = comps[first.component],
  tools = [
    <First {...first} key="0" path="/" KEY={first.key} />,
    ...tabs.map((e) => {
      var Comp = comps[e.component];
      return <Comp {...e} path={e.key} KEY={e.key} />;
    }),
  ];
export { tools };

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
});

const Tool = ({ path, notify, children, location }) => {
  const tab = location.pathname.replace(path, '').split('/')[1],
    onTabChange = (tab) => {
      notify && notify(tab);
    };
  //!!!For DevTool - overload reources(lookups and schema, i.e. common types)
  const context = useContext(AppContext), //{cache, formProvider, config, i18n, t, Logger}
    { lookupsMng, schema } = context;
  Object.assign(schema, parseGraphQL(extraSchema, schema));
  context.user = user;
  //lookupsMng.init('lookups_plg');
  //Use below ONLY if need to set new lookups

  return (
    <div className="app-full-size app-flex-v">
      <ApolloProvider client={client}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <h2>Developer Tools</h2>
          <NavLink
            to="/"
            icon="undo"
            text="Back to app"
            intent="danger"
          />
        </div>
        <TabbedPages
          id="Tools"
          tabs={tabs}
          selectedTabId={tab}
          notify={onTabChange}
          // expander={() => (
          //   <NavLink to="/" icon="undo" text="Back to app" intent="danger" />
          // )}
        >
          {children}
        </TabbedPages>
      </ApolloProvider>
    </div>
  );
};

export default Tool;
