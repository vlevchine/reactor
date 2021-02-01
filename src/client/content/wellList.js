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
  parentRoute,
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
            {
              title: 'Name',
              id: 'name',
              display: 'Link',
              path: [...parentRoute, 'well'].join('/'),
            },
            { title: 'Licensee', id: 'licensee', display: 'text' },
            { title: 'Uwi', id: 'uwi' },
            {
              title: 'Type',
              id: 'type',
              display: 'Tag',
            },
            { title: 'Purpose', id: 'purpose' },
            {
              title: 'Depth',
              id: 'depth',
            },
            {
              title: 'Crown',
              id: 'crownOwned',
            },
            { title: 'Spud date', id: 'spudDate' },
            { title: 'Field', id: 'field', hidden: true },
            { title: 'Rig', id: 'rig', hidden: true },
            {
              title: 'License date',
              id: 'licenseDate',
              hidden: true,
            },
          ]}
          filters={[
            { id: 'name' },
            { id: 'licensee' },
            { id: 'type' },
            { id: 'purpose', multi: true },
          ]}
        />
      </Form>
    </>
  );
};

WellList.propTypes = {
  def: PropTypes.object,
  parentRoute: PropTypes.array,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default WellList;
