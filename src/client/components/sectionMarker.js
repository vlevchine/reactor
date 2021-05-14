import PropTypes from 'prop-types';

SectionMarker.propTypes = {
  id: PropTypes.string,
  onSelect: PropTypes.func,
};
export default function SectionMarker({ id, onSelect }) {
  return (
    <div
      role="button"
      tabIndex="-1"
      onMouseDown={() => {
        onSelect?.(id);
      }}
      className="form-grid-cover">
      <h6>{`<Panel>`}</h6>
    </div>
  );
}
