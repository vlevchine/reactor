import PropTypes from 'prop-types';
//import Form, { Field } from '@app/formit';
import { BasicTable } from '@app/components';

const req = {
    type: 'Well',
    project:
      'id licensee licenseDate name uwi depth spudDate purpose field rig type crownOwned',
    options: { size: 20 },
    common: 2,
  },
  key = 'well';
export const config = {
  entity: { [key]: req },
};

const style = { height: '46rem', width: '90%' },
  filters = [
    { id: 'name' },
    { id: 'licensee' },
    { id: 'type' },
    { id: 'purpose', multi: true },
    { id: 'crownOwned' },
  ],
  columns = [
    {
      title: 'Name',
      id: 'name',
      use: 'Link',
      route: 'well',
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
  ];

//Display/edit item details - <WellList>
const WellList = ({ def, model, ctx }) => {
  const navRequest = (id) => {
    ctx.nav.dispatch({
      path: 'requestRoute',
      value: { key: def.itemRoute, id },
    });
  };

  return (
    <>
      <h6>WellList</h6>
      <BasicTable
        dataid={key}
        value={model?.[key]}
        meta={ctx.schema?.[req.type]}
        lookups={ctx.lookups}
        pageSize={req.options.size} //query.params?.options?.size
        title="List of wells"
        //movable={false}
        canFilter
        dynamicColumns
        editable
        //  disabled
        onNav={navRequest}
        selection="single"
        style={style}
        columns={columns}
        filters={filters}
      />
      {/* <Form
        id="Sample"
        title="Form with table"
        layout={layout}
        {...rest}>
        <Field
          dataid="well"
          type="BasicTable"
          pageSize={req.options.size} //query.params?.options?.size
          title="List of wells"
          loc={loc}
          //movable={false}
          canFilter
          dynamicColumns
          editable
          selection="single"
          style={style}
          columns={columns}
          filters={filters}
        />
      </Form> */}
    </>
  );
};

WellList.propTypes = {
  def: PropTypes.object,
  ctx: PropTypes.object,
  model: PropTypes.object,
  parentRoute: PropTypes.string,
};

export default WellList;
