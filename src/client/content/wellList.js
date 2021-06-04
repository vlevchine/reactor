import PropTypes from 'prop-types';
import Form, { Field } from '@app/components/formit';
import '@app/content/styles.css';

//Display/edit item details - <WellList>
const WellList = ({
  model,
  // cached = {},
  // cache,
  // store,
  def,
  parentRoute,
  //ctx,
  ...rest
}) => {
  const query = def.dataQuery[0],
    bound = query?.name || query?.alias,
    resource = rest.ctx.dataResource?.resources?.[bound];

  return (
    <>
      <h6>WellList</h6>
      <Form
        id="Sample"
        title="Form with table"
        layout={{ cols: 1, rows: 1 }}
        {...rest}
        resource="wells"
        params={resource?.params}
        model={model[bound]}
        schema={resource?.valueType?.fields}>
        <Field
          id="1"
          type="Table"
          // dataid="entities"
          //may provide it directly, as value={model?.[name] || {}} or via boundTo
          pageSize={10} //query.params?.options?.size
          //request={onPaging}
          title="List of wells"
          loc={{ row: 1, col: 1 }}
          //movable={false}
          canFilter
          dynamicColumns
          editable
          selection="single"
          style={{ height: '40rem' }}
          columns={[
            {
              title: 'Name',
              id: 'name',
              display: 'Link',
              route: `${parentRoute}well`,
              on: true, // Link must be always on!!!
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
              display: 'Checkbox',
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
            { id: 'crownOwned' },
          ]}
        />
      </Form>
    </>
  );
};

WellList.propTypes = {
  def: PropTypes.object,
  parentRoute: PropTypes.string,
  lookups: PropTypes.object,
  model: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  ctx: PropTypes.object,
};

export default WellList;
