import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import {
  Tabs as TabsComp,
  CollapsiblePanel,
} from '@app/components/core';
export { default as Field } from './field';
import Section, { InDesignSection } from './formSection';
import { FormPanelHeader } from './formSectionContent';
import { styleItem } from './helpers';
import { mergeIds } from './core/helpers';

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
export function Tabs({
  id,
  dataid,
  parent,
  loc,
  children,
  items,
  vertical,
  title,
  ...rest
}) {
  const { ctx, inDesign, selected, toolbar } = rest,
    { state, nav } = ctx,
    onTab = (tab) => {
      //store report selection selectTab(tab);
      // rest.onSelect?.(tab);
      rest.onChange({ [id]: tab }, id, 'ui');
    },
    tabs = (
      items || Children.toArray(children).map((e) => e.props)
    ).filter((e) => !state?.[e.hide]),
    Sect = inDesign ? InDesignSection : Section;

  return (
    <div
      style={styleItem(loc)}
      className={classNames(['form-grid-item'], {
        outlined: inDesign && id === selected,
      })}>
      <FormPanelHeader>
        <>
          <span>{title || (toolbar && '<Tabs section title>')}</span>
          {inDesign && toolbar && toolbar({ id, name: 'TabPanel' })}
        </>
      </FormPanelHeader>
      <TabsComp
        id={id}
        selected={nav.state?.[id]}
        vertical={vertical}
        onSelect={onTab}>
        {tabs.map((e) => (
          <TabsComp.Tab key={e.id} id={e.id} name={e.title}>
            <Sect
              {...rest}
              {...e}
              id={mergeIds(id, e.id, rest.id)}
              disableAll={state?.[e.disable]}
              parent={mergeIds(parent, dataid)}
            />
          </TabsComp.Tab>
        ))}
      </TabsComp>
    </div>
  );
}

Panel.propTypes = {
  title: PropTypes.string,
  loc: PropTypes.object,
};
export function Panel({ title, loc, ...rest }) {
  const { id, toolbar, inDesign, selected } = rest,
    Sect = inDesign ? InDesignSection : Section;
  return (
    <div
      className={classNames(['form-grid-item'], {
        outlined: inDesign && id === selected,
      })}
      style={styleItem(loc)}>
      <CollapsiblePanel
        title={() => (
          <>
            {title && <span>{title}</span>}
            {inDesign && toolbar && toolbar({ name: 'Panel', id })}
          </>
        )}
        style={styleItem(loc)}>
        <Sect {...rest} id={id} />
      </CollapsiblePanel>
    </div>
  );
}

//TBD
Group.propTypes = {
  title: PropTypes.string,
};
export function Group() {
  return <div>Form group</div>;
}
