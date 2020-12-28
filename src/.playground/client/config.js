import React, { Fragment, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query, Mutation, ApolloConsumer } from 'react-apollo';
import { Button } from '@app/components';
import CodeEditorSimple from '@app/components/codeEditorSimple';

const GET_CONFIG = gql`
    query {
      config
    }
  `,
  UPDATE_CONFIG = gql`
    mutation UpdateConfig($value: String!) {
      updateConfig(value: $value)
    }
  `;
const reducer = (state, action) => {
  const res = action.server
    ? { ...action, user: action.server }
    : { ...state, ...action };
  res.synced = res.user === res.server;
  return res;
};

const Config = ({ className }) => {
  const [code, setCode] = useState('Loading...'),
    [val, setVal] = useState(),
    [state, dispatch] = useReducer(reducer, { server: '' }),
    onChange = ({ id, value }) => {
      dispatch({ user: value });
    };

  return (
    <Fragment>
      <Mutation
        mutation={UPDATE_CONFIG}
        update={(cache, { data: { updateConfig } }) => {
          cache.writeQuery({
            query: GET_CONFIG,
            data: { config: updateConfig },
          });
        }}>
        {(updateConfig, { loading, error, data }) => (
          <div style={{ display: 'flex', marginBottom: '0.4rem' }}>
            <h3 style={{ marginTop: '0.6rem' }}>App Configuration</h3>
            &nbsp; &nbsp;
            <Button
              icon="undo"
              minimal
              text="Undo changes"
              disabled={state.synced}
              onClick={() => {
                dispatch({ user: state.server });
              }}
            />
            &nbsp;
            <Button
              icon="refresh"
              minimal
              text="Save changes"
              loading={loading}
              disabled={state.synced}
              onClick={() => {
                updateConfig({
                  variables: { value: state.user },
                });
              }}
            />
            {error && <p>Error :( Please try again)</p>}
          </div>
        )}
      </Mutation>
      <Query query={GET_CONFIG} notifyOnNetworkStatusChange>
        {({ data, error, loading, networkStatus }) => {
          const text =
            networkStatus === 4
              ? 'Refetching!'
              : loading
              ? 'Loading...'
              : error
              ? `Error! ${error}`
              : data.config;
          if (state.server !== text) dispatch({ server: text });
          return (
            <CodeEditorSimple
              id="_config"
              notify={onChange}
              value={state.user}
            />
          );
        }}
      </Query>
    </Fragment>
  );
};

Config.propTypes = {
  className: PropTypes.string,
};

export default Config;
