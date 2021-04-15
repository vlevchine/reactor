import { useState, Children, useLayoutEffect, useRef } from 'react';
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
};

export function TabStrip({
  id,
  tabs = [],
  selected,
  onSelect,
  style,
  display = 'name',
  vertical,
}) {
  const [active, seActive] = useState(selected || tabs[0]?.id),
    onTab = (id) => {
      seActive(id);
      onSelect?.(id);
    },
    ref = useRef(null);

  useLayoutEffect(() => {
    const [radio, markers] = [...ref.current.childNodes];
    markers.style.width = `${radio.clientWidth}px`;
  }, []);

  useLayoutEffect(() => {
    const [radio, markers] = [...ref.current.childNodes],
      ind = tabs.findIndex((e) => e.id === active),
      sel = [...radio.childNodes].filter(
        (e) => e.localName === 'label'
      )[ind],
      marker = markers.firstChild,
      wrapper = radio?.getBoundingClientRect(),
      box = sel?.getBoundingClientRect();
    marker.style.left = `${box?.left - wrapper.x}px`;
    marker.style.width = `${sel?.clientWidth}px`;
    radio.scrollI;
    radio.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [active]);

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
      <div ref={ref} className="tab-markers">
        <div className="tab-marker" />
      </div>
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
  tabs,
  onSelect,
  children,
  style,
  className,
  tabStyle,
  render,
  ...rest
}) {
  const _tabs =
      tabs || Children.toArray(children).map((e) => e.props),
    [active, setActive] = useState(selected || _tabs[0]?.id),
    onTab = (id) => {
      setActive(id);
      onSelect?.(id);
    };

  return (
    <section
      className={classNames(['tab-container', className])}
      style={style}>
      <TabStrip
        {...rest}
        tabs={_tabs}
        selected={active}
        style={tabStyle}
        onSelect={onTab}
      />
      {_tabs.map((e) => (
        <div
          key={e.id}
          className={classNames(['reveal tab-content'], {
            on: e.id === active,
          })}>
          {render(e)}
        </div>
      ))}
    </section>
  );
}

function Tab(props) {
  return <div {...props} />;
}
Tabs.Tab = Tab;
