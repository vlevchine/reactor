import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
  lazy,
} from 'react';
import PropTypes from 'prop-types';
import { getLookups, reduceSchemas } from '@appRoot/utilsParser';
import { useSchemas, useResource } from '@app/hooks';
import { findInItems } from '@app/helpers';
import Suspended from '@app/suspended';
import { AppContext } from '@app/contextProvider';
import ErrorBoundary from '@app/errorBoundary';
import store from '@app/services';
import { Accordion } from '@app/components';
import formics from '@app/components/formics';
import classes from './styles.css';

const { Formit, Card, Callout } = formics;
const getComponent = (key) => {
  const [k1, k2] = key.split('.'),
    comp = formics[k1] || {};
  return k2 ? comp[k2] || {} : comp;
};
const ROOT = './_forms',
  itemsProp = ['groups'];
//Actual async func to access page cache - store.cache.fetch
//fetchPageData - fake func to access model data (instead og fetching from server)
const fakeFetchData = (story) => Promise.resolve(story.context.model);
const FormStory = ({ story, context }) => {
  //FormStory plays a role of Page: async loads form, cache and data
  //actual Page will (most likely) have Form defined explicitly;
  //app will use context.dataProvider, here we use fakeFetchData instead
  context.dataProvider.get = () => fakeFetchData(story);
  //page will capture navigation params as pageParams
  const pageParams = { wellId: 'well#1', activityId: 'activity#1' },
    Form = lazy(() => import(`${ROOT}/${story.form.path}`)),
    { schema, store, lookupsMng, cache } = context,
    //queryType - should be collected somehow from all forms on page
    appliedSchema = reduceSchemas(schema, null, story.queryTypes),
    refs = getLookups(appliedSchema),
    pageConfig = {
      type: story.type,
      key: story.key,
    },
    pageCacheResourse = useResource(cache.fetch, pageConfig),
    pageDataResourse = useResource(context.dataProvider.get, story),
    pageLookups = useResource(lookupsMng.fetchAll, refs);

  useEffect(() => {
    //when entering page, need to cache page relaetd data
    story.pageData &&
      cache.save(
        { type: story.type, key: story.name },
        { data: story.pageData }
      );
  }, []);

  return (
    <Suspended
      errorText={(error) => `Error in story ${story.id}: ${error}`}
      loadingText="Loading form ...">
      <Form
        parentConfig={pageConfig}
        pageParams={pageParams}
        ctx={{ ...context }}
        pageCache={pageCacheResourse}
        pageData={pageDataResourse}
        pageLookups={pageLookups}
        {...story.context}
        schema={appliedSchema}
      />
    </Suspended>
  );
};

const Browser = (props) => {
  const { root, className, topic, KEY } = props,
    context = useContext(AppContext), //{ formProvider, config, i18n, t, Logger}
    //this is an opportunity to enhance context with page-specific data
    //store = context.store,
    resource = context.resourse,
    firstGroup = root.first({}),
    [open, setOpen] = useState(firstGroup.key),
    [selected, select] = useState(),
    [pageConfig, setConfig] = useState({}),
    [active, setActive] = useState(),
    [model, setModel] = useState({}),
    update = store.getDispatcher(
      store.actions.UPDATE,
      KEY,
      store.topics[topic]
    );

  const onSelect = (key) => {
      if (!key) return setOpen(key);
      const node = findInItems(root.groups, key, {
        itemsProp: 'groups',
      });
      if (node.groups) {
        setOpen(node.key);
      } else {
        if (node.model) {
          const oper = store.getDispatcher(
            store.actions.SET,
            KEY,
            store.topics[topic]
          );
          oper(node.model);
        }
        setActive(node);
        select(key);
      }
    },
    onUpdate = (v, id) => {
      setModel({ ...model, [id]: v });
    };

  useEffect(() => {
    const sub = store.subscribe(store.topics[topic], (val) => {
      val[KEY] && setModel(val[KEY]);
    });
    return () => store.unsubscribe(sub, store.topics[topic]);
  }, []);

  return (
    <div className={classes['comp-wrapper']}>
      <aside className={classes['comp-aside']}>
        <h5>{topic}</h5>
        <Accordion
          items={root[itemsProp[0]]}
          itemsProp={itemsProp}
          labelProp="name"
          btnLarge={true}
          open={open}
          onSelect={onSelect}
        />
      </aside>
      <section className={classes['comp-main']}>
        {active ? (
          active.form ? (
            <FormStory story={active} context={context} />
          ) : (
            <Formit
              id="testForm"
              title={active.name}
              {...active.options}
              {...active.context}>
              {active.scenarios.map((e) => {
                const Comp = e.Comp,
                  id = [selected, e.id].join('.');

                return active.options.useCards ? (
                  <Card
                    key={id}
                    elevation={1}
                    title={e.name}
                    style={{ margin: '0 0.2rem' }}>
                    <Comp
                      value={model[id]}
                      onChange={onUpdate}
                      dataid={id}
                    />
                  </Card>
                ) : (
                  <Comp
                    key={id}
                    value={model[id]}
                    onChange={onUpdate}
                    dataid={id}
                  />
                );
              })}
            </Formit>
          )
        ) : (
          <Callout title="Select story to browse">
            Stories are grouped, please select a leaf story to view
            all defined scenarios...
          </Callout>
        )}
      </section>
    </div>
  );
};

Browser.propTypes = {
  className: PropTypes.string,
  topic: PropTypes.string,
  KEY: PropTypes.string,
};

export default Browser;
