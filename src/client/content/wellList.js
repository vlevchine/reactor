import PropTypes from 'prop-types';
import Form, { Component } from '@app/components/formit';
import '@app/content/styles.css';

//Display/edit item details - <WellList>
const WellList = ({
  // data = {},
  // cached = {},
  // cache,
  // store,
  def,
  // className = '',
  ...rest
}) => {
  const query = def.dataQuery[0];
  return (
    <>
      <h6>WellList</h6>
      <Form layout={{ cols: 1, rows: 1 }} {...rest} boundTo={query}>
        <Component
          component="Table"
          dataid={undefined}
          //mayprovide it directly, as value={model?.[name] || {}} or via boundTo
          pageSize={query.params?.options?.limit}
          //request={onPaging}
          title="List of wells"
          loc={{ row: 1, col: 1 }}
          movable={false}
          editable
          selection="single"
          style={{ height: '40rem' }}
          columns={[
            { title: 'Licensee', id: 'licensee', display: 'text' },
            { title: 'Name', id: 'name' },
            { title: 'Uwi', id: 'uwi' },
            {
              title: 'Type',
              id: 'type',
              prop: 'name',
              display: 'tag',
            },
            { title: 'Purpose', id: 'purpose' },
            {
              title: 'Depth',
              id: 'depth',
            },
            { title: 'Spud date', id: 'spudDate' },
          ]}
        />
      </Form>
    </>
  );
};

WellList.propTypes = {
  def: PropTypes.object,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default WellList;
