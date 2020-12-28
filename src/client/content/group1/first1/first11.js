import PropTypes from 'prop-types';
import { Input } from '@app/components/core'; //InputWrapper,
import Form, { Field, Section, Panel } from '@app/components/formit';
import '@app/content/styles.css';

//Display/edit item details - <First11>
const First11 = (props) => {
  const { ctx, def } = props,
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
      <Form layout={{ cols: 1, rows: 5 }} ctx={ctx} boundTo={query}>
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
            dataid="age"
            loc={{ col: 3, row: 1 }}
            style={{ width: '22rem' }}
            clear
            icon="user"
            info="kg/m"
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
           />
          <TagGroup
            dataid="films"
            loc={{ col: 3, row: 2 }}
            clear
            icon="user"
            display="title"
            intent="warning"
            //tagIntent="success"
            style={{ width: '22rem' }}
            //disabled
            label="Label here"
          />
          <div loc={{ col: 2, row: 2 }} style={{ color: 'red' }}>
            <h4 style={{ color: 'blue' }}>HTML cell</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat.
            </p>
          </div>*/}
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
        </Panel>
      </Form>
    </>
  );
};

First11.propTypes = {
  def: PropTypes.object,
  ctx: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default First11;
