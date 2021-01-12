import { useState } from 'react';
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
};

export function TabStrip({
  id,
  tabs,
  selected,
  onSelect,
  style,
  display,
}) {
  const [active, seActive] = useState(selected || tabs[0].id),
    onTab = (id) => {
      seActive(id);
      onSelect?.(id);
    };

  return (
    <nav role="tabpanel">
      <Radio
        id={id}
        groupOf="tabs"
        horizontal
        display={display}
        options={tabs}
        style={style}
        value={active}
        onChange={onTab}
      />
    </nav>
  );
}

Tabs.propTypes = {
  id: PropTypes.string,
  onSelect: PropTypes.func,
  tabs: PropTypes.array,
  selected: PropTypes.string,
  style: PropTypes.object,
  display: PropTypes.string,
  children: PropTypes.func,
};
export default function Tabs({
  id,
  display,
  selected,
  tabs,
  onSelect,
  children,
  style,
}) {
  const [active, setActive] = useState(selected || tabs[0].id),
    onTab = (id) => {
      setActive(id);
      onSelect?.(id);
    };

  return (
    <section className="flex-column">
      <nav role="tabpanel">
        <Radio
          id={id}
          groupOf="tabs"
          horizontal
          display={display}
          options={tabs}
          style={style}
          value={active}
          onChange={onTab}
        />
      </nav>
      {tabs.map((e) => (
        <div
          key={e.id}
          className={classNames(['reveal'], {
            on: e.id === active,
          })}>
          {children(e)}
        </div>
      ))}
    </section>
  );
}
