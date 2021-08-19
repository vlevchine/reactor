import { useReducer, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  useBlocker,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { classNames } from '@app/helpers';
import { Button, Portal } from '@app/components/core';

function reducer(state, msg) {
  return { ...state, ...msg };
}
function usePrompt(when) {
  const navigate = useNavigate(),
    location = useLocation();
  const [state, dispatch] = useReducer(reducer, {
      showPrompt: false,
      lastLocation: null,
      confirmedNavigation: false,
    }),
    { showPrompt, lastLocation, confirmedNavigation } = state;

  const cancelNavigation = useCallback(() => {
      dispatch({ showPrompt: false });
    }, []),
    handleBlockedNavigation = useCallback(
      (nextLocation) => {
        if (
          !confirmedNavigation &&
          nextLocation.location.pathname !== location.pathname
        ) {
          dispatch({ showPrompt: true, lastLocation: nextLocation });
          return false;
        }
        return true;
      },
      [confirmedNavigation]
    ),
    confirmNavigation = useCallback(() => {
      dispatch({ showPrompt: false, confirmedNavigation: true });
    }, []);

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation.location.pathname);
    }
  }, [confirmedNavigation, lastLocation]);

  useBlocker(handleBlockedNavigation, when);

  return [showPrompt, confirmNavigation, cancelNavigation];
}

AlertDialog.propTypes = {
  isBlocking: PropTypes.bool,
  isSaving: PropTypes.bool,
  onSave: PropTypes.func,
}; //, isSaving, onSave
export default function AlertDialog({ isBlocking }) {
  const [showPrompt, confirmNavigation, cancelNavigation] = usePrompt(
    isBlocking
  );

  return showPrompt ? (
    <Portal className="modal-root">
      <div
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex="0"
        className={classNames([
          'modal',
          showPrompt ? 'modal-show' : 'modal-hide',
        ])}>
        <div className="modal-header">
          <h3>Unsaved data</h3>
          <Button
            prepend="times"
            minimal
            onClick={cancelNavigation}
          />
        </div>
        <div className="modal-content">
          <p>
            Page contains unsaved data. Please, confirm navigation
            (data will be lost) or stay on a page.
          </p>
        </div>
        <div className="modal-footer">
          <Button
            text="Confirm"
            prepend="check"
            onClick={confirmNavigation}
          />
          &nbsp;&nbsp;
          <Button
            text="Stay"
            prepend="times"
            onClick={cancelNavigation}
          />
        </div>
      </div>
    </Portal>
  ) : null;
}
