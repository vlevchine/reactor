import React from 'react';
import PropTypes from 'prop-types';
import CodeEditorSimple from '@app/components/codeEditorSimple';

const value = `
import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <h1>Hello world</h1>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
`;
const Model = ({ className }) => (
  <div className={className}>
    <h4>Model</h4>
    {/* <CodeEditorSimple value={value} notify={() => {}} /> */}
  </div>
);

Model.propTypes = {
  className: PropTypes.string,
};

export default Model;
