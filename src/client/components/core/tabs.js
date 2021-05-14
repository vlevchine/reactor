import { useState, Children, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Radio } from '.';
import './styles.css';

TabStrip.propTypes = {
  id: PropTypes.string,
  onSelect: PropTypes.func,
  tabs: PropTypes.array,
  selected: PropTypes.string,
  style: PropTypes.object,
  display: PropTypes.string,
  vertical: PropTypes.bool,
  toolbar: PropTypes.func,
};

export function TabStrip({
  id,
  tabs = [],
  selected,
  onSelect,
  style,
  display = 'name',
  vertical,
  toolbar,
}) {
  const [active, seActive] = useState(selected || tabs[0]?.id),
    onTab = (_id) => {
      seActive(_id);
      onSelect?.(_id, id);
    },
    ref = useRef(null);

  return (
    <nav ref={ref} role="tabpanel" style={style}>
      <Radio
        id={id}
        groupOf="tabs"
        horizontal={!vertical}
        display={display}
        options={tabs}
        value={active}
        onChange={onTab}
      />
      {toolbar?.()}
    </nav>
  );
}

Tabs.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  onSelect: PropTypes.func,
  tabs: PropTypes.array,
  selected: PropTypes.string,
  style: PropTypes.object,
  display: PropTypes.string,
  vertical: PropTypes.bool,
  tabStyle: PropTypes.object,
  children: PropTypes.array,
  render: PropTypes.func,
};
export default function Tabs({
  selected,
  onSelect,
  children,
  style,
  className,
  tabStyle,
  vertical,
  ...rest
}) {
  const tabs = Children.toArray(children).map((e) => e.props),
    [active, setActive] = useState(selected || tabs[0]?.id),
    onTab = (id, contId) => {
      setActive(id);
      onSelect?.(id, contId);
    };

  return (
    <section
      className={classNames(['tab-container', className], {
        row: vertical,
      })}
      style={style}>
      <TabStrip
        {...rest}
        tabs={tabs}
        selected={active}
        style={tabStyle}
        onSelect={onTab}
        vertical={vertical}
      />
      {tabs.map((e) =>
        e.id === active ? (
          <div key={e.id} className="reveal tab-content on">
            {e.children}
          </div>
        ) : null
      )}
    </section>
  );
}

function Tab(props) {
  return <div {...props} />;
}
Tabs.Tab = Tab;
