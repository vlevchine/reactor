import PropTypes from 'prop-types';
import { dropdownCloseRequest, useChangeReporter } from '../helpers';
import { Decorate } from '..';
import { _ } from '@app/helpers';
import { Menu } from '../menu/menu';

function targetId(target) {
  return target?.id || target?.parentElement?.id;
}
const animOptions = { duration: 300 };
SelectTree.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool,
  intermediate: PropTypes.bool,
  clear: PropTypes.bool,
  display: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  innerStyle: PropTypes.object,
};
function renderVal(v = '', options) {
  const info = v.split('.').reduce(
    (acc, e) => {
      const item = acc.items?.find((o) => o.id === e);
      if (item) {
        acc.lbl.push(item.label);
        acc.items = item.items;
      }
      return acc;
    },
    { lbl: [], items: options }
  );

  return info.lbl.join(' / ');
}
export function SelectTree(props) {
  const {
      id,
      value,
      display = 'label',
      options,
      intermediate,
      disabled,
      clear,
      innerStyle,
    } = props,
    [_value, reset] = useChangeReporter(value, props),
    onClick = ({ target }, dt) => {
      if (dt.onDropdown) {
        const _id = targetId(target),
          v = _.getInItems(options, _id),
          isLeaf = v && !v.items;
        reset(isLeaf || (intermediate && v) ? _id : undefined);
      }
      if (!dt.onWrapper) dropdownCloseRequest(id);
    };

  return (
    <Decorate
      {...props}
      clear={clear && _value ? reset : undefined}
      append="angle-down"
      dropdown={
        disabled
          ? undefined
          : {
              component: (
                <Menu
                  items={options}
                  withLabel
                  display="name"
                  className="fit"
                />
              ),
              animate: animOptions,
              onClick,
              className: 'fit',
            }
      }>
      <input
        value={renderVal(_value, options, display)}
        disabled
        className="no-border infoboard text-dots"
        style={innerStyle}
      />
    </Decorate>
  );
}
