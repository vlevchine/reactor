import { useMemo, Children } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { Collapsible, Tabs } from '@app/components/core';
export { default as Field } from './field';
import Section from './formSection';

function Tab() {
  return <div />;
}
FormTabs.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
  rest: PropTypes.any,
};
FormTabs.Tab = Tab;
export function FormTabs({ id, children, ...rest }) {
  const tabs = Children.toArray(children).map((e) => e.props),
    { state } = rest.ctx.nav,
    active = state?.[id] || tabs[0].id,
    onTab = (tab) => {
      rest.onChange({ [id]: tab }, id, 'ui');
    };
  console.log(state?.[id]);
  return (
    <Tabs
      id={id}
      tabs={tabs}
      selected={active}
      display="title"
      horizontal
      onSelect={onTab}>
      {(e) => <Section {...rest} {...e} />}
    </Tabs>
  );
}

FormPanel.propTypes = {
  title: PropTypes.string,
};
export function FormPanel({ title, ...rest }) {
  const id = useMemo(() => nanoid(4), []);
  //TBD: always start open???
  return (
    <Collapsible
      id={id}
      title={title}
      className="panel-title"
      iconSize="lg"
      open={true}>
      {<Section {...rest} />}
    </Collapsible>
  );
}

//TBD
FormGroup.propTypes = {
  title: PropTypes.string,
};
export function FormGroup() {
  return <div>Form group</div>;
}
