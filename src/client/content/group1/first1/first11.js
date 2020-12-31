import PropTypes from 'prop-types';
import { Input } from '@app/components/core'; //InputWrapper,
import Form, { Field, Section, Panel } from '@app/components/formit';
import '@app/content/styles.css';

//Display/edit item details - <First11>
const First11 = (props) => {
  const { ctx, def, model } = props,
    query = def.dataQuery[0],
    onClick = () => {
      console.log(query);
    };

  return (
    <>
      <h4>{def.title}</h4>
      <Input
        value="Out of form"
        clear
        fill={false}
        onchange={onClick}
      />
      &nbsp;&nbsp;&nbsp;
      <Form
        layout={{ cols: 1, rows: 5 }}
        ctx={ctx}
        model={model}
        boundTo={query}>
        <Field
          type="input"
          dataid="first"
          loc={{ col: 1, row: 1 }}
          style={{ width: '60rem' }}
          //fill
          intent="warning"
          clear
          icon="user"
          info="tint"
          label="First name 1"
        />
        <Section
          title="Section #AAA"
          loc={{ col: 1, row: 2 }}
          layout={{ cols: 3, rows: 2 }}>
          <div loc={{ col: 2, row: 2 }} style={{ color: 'red' }}>
            <h4 style={{ color: 'blue' }}>HTML cell</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat.
            </p>
          </div>
          <Field
            type="input"
            dataid="email"
            loc={{ col: 1, row: 1 }}
            //style={{ width: '22rem' }}
            intent="success"
            clear
            icon="user"
            info="tint"
            label="E-mail"
            message="Success here..."
          />
          <Field
            type="input"
            dataid="first"
            loc={{ col: 2, row: 1 }}
            //clear
            //fill
            icon="user"
            info="tint"
            label="First name"
            message="Testing it"
          />
          <Field
            type="number"
            dataid="height"
            loc={{ col: 3, row: 1 }}
            style={{ width: '22rem' }}
            clear
            icon="user"
            label="Person height"
          />
          <Field
            type="tagGroup"
            dataid="films"
            loc={{ col: 3, row: 2 }}
            clear
            icon="user"
            display="title"
            intent="warning"
            tagIntent="success"
            //style={{ width: '26rem' }}
            //disabled
            label="Label here"
          />
          {/*   <DateInput
            dataid="release"
            loc={{ col: 3, row: 1 }}
            style={{ color: 'bluem' }}
            width="30rem"
            clear
            icon="user"
            label="Date input"
            error="Warning..."
          />
          <MaskedInput
            dataid="release"
            loc={{ col: 3, row: 1 }}
            clear
            style={{ width: '30rem' }}
            icon="user"
            label="Masked input"
            type="date"
           />*/}
        </Section>
        <Panel
          title="Section #AAA"
          loc={{ col: 1, row: 3 }}
          layout={{ cols: 3, rows: 2 }}>
          <Field
            type="input"
            dataid="last"
            loc={{ col: 1, row: 1 }}
            //clear
            //fill
            icon="user"
            info="tint"
            label="Last name"
            message="Testing it"
          />
          <Field
            type="checkbox"
            dataid="active"
            loc={{ col: 2, row: 1 }}
            toggle
            intent="success"
            label="Hello"
            text="A Boolean attribute indicating whether or not this checkbox is checked by default (when the page loads). It does not indicate whether this checkbox is currently checked:"
          />
          {/* <Dropdown
            loc={{ col: 2, row: 2 }}
            id="drop"
            icon="ellipsis-v"
            title="My dropdown"
            toggleIcon
            // light
            minimal
            //hover
            //placeRight
            //horizontal
            options={[
              {
                icon: 'edit',
                title: 'Edit',
                action: () => {
                  console.log('edit');
                },
              },
              {
                icon: 'plus',
                title: 'This is a longer name for option',
                action: () => {
                  console.log('add');
                },
              },
              {
                icon: 'times',
                title: 'Remove',
                action: () => {
                  console.log('remove');
                },
                confirm: 'Are you sure you want to delete this row?',
              },
            ]}
          /> */}
        </Panel>
      </Form>
    </>
  );
};

First11.propTypes = {
  def: PropTypes.object,
  ctx: PropTypes.object,
  model: PropTypes.object,
  className: PropTypes.string,
};

export default First11;
