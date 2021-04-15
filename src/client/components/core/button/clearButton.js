import PropTypes from 'prop-types';
import Button from './button';

ClearButton.propTypes = {
  clear: PropTypes.bool,
  id: PropTypes.string,
  onChange: PropTypes.func,
};

export default function ClearButton({ clear, id, onChange }) {
  const onClear = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    onChange?.(undefined, id);
  };
  return clear ? (
    <Button
      className="clip-icon close"
      minimal
      onClick={onClear}
      role="deletion"></Button>
  ) : null;
}
