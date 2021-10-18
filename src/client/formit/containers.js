import { Children } from 'react';
import PropTypes from 'prop-types';
import { _, classNames } from '@app/helpers';
import { Tabs, CollapsiblePanel, Title } from '@app/components/core';
import Form from './formit';
export { default as Field } from './field';
import Section, { InDesignSection } from './section';
import { FormPanelHeader } from './sectionContent';
import { styleItem } from './helpers';

TabPanel.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  parent: PropTypes.string,
  dataid: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  vertical: PropTypes.bool,
  selected: PropTypes.string,
  loc: PropTypes.object,
};
export function TabPanel({
  id,
  dataid,
  parent,
  loc,
  children,
  items,
  vertical,
  title,
  selected,
  ...rest
}) {
  const { state, inDesign, toolbar } = rest,
    onTab = (tab) => {
      // report selection selectTab(tab);
      // rest.onSelect?.(tab);
      rest.onChange?.({ [id]: tab }, id, 'ui');
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
      {inDesign ? (
        <FormPanelHeader>
          <>
            <span>
              {title || (toolbar && '<Tabs section title>')}
            </span>
            {toolbar && toolbar({ id, name: 'TabPanel' })}
          </>
        </FormPanelHeader>
      ) : (
        title && (
          <FormPanelHeader>
            <span>{title}</span>
          </FormPanelHeader>
        )
      )}
      <Tabs
        id={id}
        className="full-size"
        selected={selected}
        vertical={vertical}
        onSelect={onTab}>
        {tabs.map((e) => (
          <Tabs.Tab key={e.id} id={e.id} name={e.title}>
            <Sect
              {...rest}
              {...e}
              id={_.dotMerge(id, e.id, rest.id)}
              disableAll={state?.[e.disable]}
              parent={_.dotMerge(parent, dataid)}
            />
          </Tabs.Tab>
        ))}
      </Tabs>
    </div>
  );
}
TabPanel.Tab = function (props) {
  return <div {...props} />;
};

Panel.propTypes = {
  title: PropTypes.any,
  loc: PropTypes.object,
  fixed: PropTypes.bool,
  direct: PropTypes.bool,
};
export function Panel({ title, loc, fixed, direct, ...rest }) {
  const { id, toolbar, inDesign, selected } = rest,
    Sect = inDesign ? InDesignSection : Section,
    panel = (
      <CollapsiblePanel
        title={
          <>
            <Title
              text={title}
              default={inDesign && '<Panel title ...>'}
            />
            {toolbar?.({ name: 'Panel', id })}
          </>
        }
        fixed={fixed}>
        <Sect {...rest} id={id} />
      </CollapsiblePanel>
    );
  return direct ? (
    panel
  ) : (
    <div
      className={classNames(['form-grid-item'], {
        outlined: inDesign && id === selected,
      })}
      style={styleItem(loc)}>
      {panel}
    </div>
  );
}

Conditional.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  scope: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  condition: PropTypes.func,
  model: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.any,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  loc: PropTypes.object,
};
export function Conditional({
  scope,
  condition,
  model,
  children,
  placeholder,
  onChange,
  className,
  loc,
  ...rest
}) {
  //scope may be defined as 'prop' or 'm:prop' or, 's:prop' ()
  const scopes = (scope || '').split(':'),
    selectScoped = scopes.length > 1 && scopes[0] === 's';
  let scopeId;
  if (selectScoped) {
    const path = rest.selection?.[scopes[1]];
    scopeId = path ? _.dotMerge(scopes[1], path) : undefined;
  } else scopeId = scopes[1] || scopes[0];
  //scopeId - tasks, path - list1
  const _model = selectScoped ? _.getIn(model, scopeId, true) : model,
    ind = condition(_model),
    changed = (v, pth, op) => {
      onChange?.(v, pth, op, { scope: scopeId });
    },
    { id, inDesign, selected } = rest;
  delete rest.type;

  return (
    <div
      className={classNames(['form-grid-item', className], {
        outlined: inDesign && id === selected,
      })}
      style={styleItem(loc)}>
      {ind > -1 ? (
        Children.map(children, ({ type, props }, i) => {
          const Type = type;
          return i === ind ? (
            <Type
              {...rest}
              {...props}
              direct
              model={_model}
              onChange={changed}
            />
          ) : null;
        })
      ) : (
        <h6>{placeholder}</h6>
      )}
    </div>
  );
}

Inline.propTypes = {
  children: PropTypes.func,
};
export function Inline({ children, ...rest }) {
  return children(rest);
}

//TBD
Group.propTypes = {
  children: PropTypes.any,
};
export function Group({ children, ...rest }) {
  return Children.map(children, ({ type, props }, i) => {
    const Type = type;
    return (
      <Type
        key={rest.dataid || i}
        {...rest}
        {...props}
        // scope={_id.join('.')}
        // model={_model}
      />
    );
  });
}

export const containers = {
  Section,
  Panel,
  TabPanel,
  Conditional,
  Group,
  Form,
  Inline,
};
export const getContainer = (type) => containers[type],
  isContainer = (type) => !!containers[type];
