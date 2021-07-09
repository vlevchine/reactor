import PropTypes from 'prop-types';
import Form, { Field } from '@app/components/formit';
import '@app/content/styles.css';

export const config = {
  domain: 'entities',
  name: 'wells',
  valueType: 'Well',
  props:
    'licensee licenseDate name uwi depth spudDate purpose field rig type crownOwned',
  options: { size: 20 },
};
//Display/edit item details - <WellList>
const WellList = ({
  // model,
  // def, // ctx,
  parentRoute,
  ...rest
}) => {
  return (
    <>
      <h6>WellList</h6>
      <Form
        id="Sample"
        title="Form with table"
        layout={{ cols: 1, rows: 1 }}
        {...rest}>
        <Field
          id="1"
          type="Table"
          // dataid="entities"
          //may provide it directly, as value={model?.[name] || {}} or via boundTo
          pageSize={config.options.size} //query.params?.options?.size
          //request={onPaging}
          title="List of wells"
          loc={{ row: 1, col: 1 }}
          //movable={false}
          canFilter
          dynamicColumns
          editable
          selection="single"
          style={{ height: '40rem', width: '90%' }}
          columns={[
            {
              title: 'Name',
              id: 'name',
              use: 'Link',
              route: `${parentRoute}well`,
              on: true, // Link must be always on!!!
            },
            { title: 'Licensee', id: 'licensee' },
            { title: 'Uwi', id: 'uwi' },
            {
              title: 'Type',
              id: 'type',
              use: 'Tag',
            },
            { title: 'Purpose', id: 'purpose' },
            {
              title: 'Depth',
              id: 'depth',
            },
            {
              title: 'Crown',
              id: 'crownOwned',
              use: 'Checkbox',
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
  model: PropTypes.object,
  ctx: PropTypes.object,
};

export default WellList;
