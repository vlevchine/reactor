import PropTypes from 'prop-types';
import { Button, AddButton } from '@app/components/core';

//page-specifc config
export const config = {};

Play.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Play({
  className = '',
  // ...rest
}) {
  return (
    <>
      <div>
        <Button
          prepend="filter"
          minimal
          size="lg"
          tooltip="Set filters"
          //  disabled
        />{' '}
        <Button
          prepend="save"
          text="Save1"
          className="normal"
          style={{ margin: '1rem' }}
          minimal
          size="lg"
          //  disabled
        />
      </div>
      <div className={className}>
        <Button
          prepend="save"
          text="Save2"
          className="normal"
          style={{ margin: '1rem' }}
          //  disabled
        />
        <Button
          prepend="save"
          text="Save3"
          className="normal"
          size="sm"
          style={{ margin: '1rem' }}
          disabled
        />
        <Button
          prepend="save"
          text="Save4"
          className="secondary"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save5"
          className="info"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save6"
          className="danger"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save7"
          className="success"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //disabled
        />
        <Button
          prepend="save"
          text="Save8"
          className="success"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          disabled
        />
      </div>
      <div className={className}>
        <Button
          prepend="save"
          text="Save2"
          className="normal dark"
          style={{ margin: '1rem' }}
          //  disabled
        />
        <Button
          prepend="save"
          text="Save3"
          className="normal  dark"
          size="sm"
          style={{ margin: '1rem' }}
          disabled
        />
        <Button
          prepend="save"
          text="Save4"
          className="secondary  dark"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save5"
          className="info  dark"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save6"
          className="danger  dark"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save7"
          className="success  dark"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //disabled
        />
        <Button
          prepend="save"
          text="Save8"
          className="success  dark"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          disabled
        />
      </div>

      <div className={className}>
        <Button
          prepend="save"
          text="Save1"
          className="invert normal"
          style={{ margin: '1rem' }}
          //  minimal
          size="lg"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save2"
          className="invert normal"
          style={{ margin: '1rem' }}
          //  disabled
        />
        <Button
          prepend="save"
          text="Save3"
          className="invert normal"
          size="sm"
          style={{ margin: '1rem' }}
          //  disabled
        />
        <Button
          prepend="save"
          text="Save4"
          className="invert secondary"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save5"
          className="invert info"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save7"
          className="invert success" //invert
          style={{ margin: '1rem' }}
          //minimal
          // tooltip="Set filters"
          disabled
        />
        <div>
          <Button
            className="clip-icon before close danger invert"
            text="Remove"
            style={{ margin: '1rem' }}
          />
          <Button
            className="clip-icon before close info"
            text="Remove"
            style={{ margin: '1rem' }}
          />
          <Button
            className="clip-icon before close success"
            text="Remove"
            style={{ margin: '1rem' }}
            disabled
          />
          <AddButton />
        </div>
      </div>
    </>
  );
}
