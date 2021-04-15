import { Children } from 'react';
import PropTypes from 'prop-types';
import {
  Tabs as TabsComp,
  CollapsiblePanel,
} from '@app/components/core';
export { default as Field } from './field';
import Section from './formSection';
import { styleItem } from './helpers';
import { mergeIds } from './core/helpers';

function Tab() {
  return <div />;
}
Tabs.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  parent: PropTypes.string,
  dataid: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  vertical: PropTypes.bool,
  loc: PropTypes.object,
};
Tabs.Tab = Tab;
export function Tabs({
  id,
  dataid,
  parent,
  loc,
  children,
  items,
  vertical,
  ...rest
}) {
  const { state, nav } = rest.ctx,
    onTab = (tab) => {
      rest.onChange({ [id]: tab }, id, 'ui');
    },
    tabs = (
      items || Children.toArray(children).map((e) => e.props)
    ).filter((e) => !e.hide?.(state));

  return (
    <TabsComp
      id={id}
      tabs={tabs}
      selected={nav.state?.[id]}
      display="title"
      className="form-grid-item "
      style={styleItem(loc)}
      vertical={vertical}
      onTab={onTab}
      render={(e) => {
        return (
          <Section
            {...rest}
            {...e}
            disableAll={e.disable?.(rest.ctx.state)}
            parent={mergeIds(parent, dataid)}
          />
        );
      }}></TabsComp>
  );
}

Panel.propTypes = {
  title: PropTypes.string,
  loc: PropTypes.object,
};
export function Panel({ title, loc, ...rest }) {
  return (
    <CollapsiblePanel
      className="form-grid-item"
      title={title}
      style={styleItem(loc)}>
      <Section {...rest} />
    </CollapsiblePanel>
  );
}

//TBD
Group.propTypes = {
  title: PropTypes.string,
};
export function Group() {
  return <div>Form group</div>;
}
