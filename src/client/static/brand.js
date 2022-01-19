import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { appState, useNavigation } from '@app/services';
import { Button, I } from '@app/components/core';

Brand.propTypes = {
  config: PropTypes.object,
};
export default function Brand({ config }) {
  const { nav } = appState,
    [min, toggle] = useState(),
    { navigateTo } = useNavigation(),
    { staticPages, title } = config,
    onNav = (data) => {
      toggle(data?.leftNavCollapse);
    };

  useEffect(() => {
    const n_sub = nav.subscribe(onNav);
    return () => nav.unsubscribe(n_sub);
  }, []);

  return (
    <Button
      minimal
      // className="info"
      onClick={() => navigateTo(staticPages.home)}>
      {/* <img src={window.location.origin + '/logo.jpg'} alt="Logo"/> //fade-in*/}
      <I name={'globe'} styled="s" size="xxxl" className="spin" />
      {!min && <h2 className="title">{title}</h2>}
    </Button>
  );
}
