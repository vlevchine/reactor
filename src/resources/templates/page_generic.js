//import { useState } from 'react';
import PropTypes from 'prop-types';
//import Form, { Section, Panel, TabPanel, Field,} from '@app/components/formit';
//import { Dropdown, Button, TextInput } from '@app/components/core';
import '@app/content/styles.css';

//page-specifc config
export const config = {};

T_Page.propTypes = {
  def: PropTypes.object,
  ctx: PropTypes.object,
  parentRoute: PropTypes.string,
  model: PropTypes.object,
};
export default function T_Page({
  def,
  ctx,
  //model
  //parentRoute
  // ...rest
}) {
  return (
    <div>
      <h3>{def.title}</h3>
      <h4>Model</h4>
      <p>{JSON.stringify(ctx)}</p>
      <h4>Def</h4>
      <p>{JSON.stringify(def)}</p>
    </div>
  );
}
