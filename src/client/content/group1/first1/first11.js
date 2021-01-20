import PropTypes from 'prop-types';
import Form, {
  Component,
  Section,
  Panel,
  Tabs,
} from '@app/components/formit';
import { Dropdown, Button, Input } from '@app/components/core'; //
import '@app/content/styles.css';

const options = [
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
];
//Display/edit item details - <First11>
const First11 = ({ def, ...rest }) => {
  const query = def.dataQuery[0],
    onClick = () => {
      console.log(query);
    };

  return (
    <>
      <h4 style={{ marginBottom: '0.5rem' }}>{def.title}</h4>
      <Input value="Out of form" clear onChange={onClick} />
      &nbsp;&nbsp;&nbsp;
      <Button text="button" onClick={onClick} />
      &nbsp;&nbsp;&nbsp;
      <Dropdown
        text="Impersonate"
        icon="user"
        arrow
        // minimal
        place="right"
        options={options}
        // className="lg-1"
      />
      <Form layout={{ cols: 1, rows: 5 }} {...rest} boundTo={query}>
        <Component
          component="Input"
          dataid="first"
          loc={{ col: 1, row: 1 }}
          //style={{ width: '20rem' }}
          intent="warning"
          clear
          icon="user"
          info="tint"
          label="First name 1"
        />
        <Section
          title="Section #AAA"
          loc={{ col: 1, row: 2 }}
          layout={{ cols: 4, rows: 2 }}>
          <div loc={{ col: 3, row: 2 }} style={{ color: 'red' }}>
            <h4 style={{ color: 'blue' }}>HTML cell</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat.
            </p>
          </div>
          <Component
            component="Input"
            dataid="email"
            loc={{ col: 1, row: 1 }}
            intent="success"
            clear
            icon="user"
            info="tint"
            label="E-mail"
            message="Success here..."
          />
          <Component
            component="Input"
            dataid="first"
            loc={{ col: 2, row: 1 }}
            clear
            icon="user"
            info="tint"
            label="First name"
            message="Testing it"
          />
          <Component
            component="InputNumber"
            dataid="height"
            loc={{ col: 1, row: 2 }}
            clear
            icon="user"
            label="Person height"
          />
          <Component
            component="Select"
            dataid="film"
            loc={{ col: 2, row: 2 }}
            label="Select Movie"
            icon="user"
            clear
            search
            //disabled
            //minimal
            //style={{ width: '22rem' }}
            filterBy="title"
            message="Not nice error"
            display={(t) => `${t.title}, ${t.year}`}
          />
          <Component
            component="TagGroup"
            dataid="films"
            loc={{ col: 3, row: 1 }}
            clear
            icon="user"
            display="title"
            intent="warning"
            tagIntent="success"
            editable
            //style={{ width: '26rem' }}
            //disabled
            label="Label here"
          />
          <Component
            component="DateInput"
            dataid="release"
            loc={{ col: 4, row: 2 }}
            // style={{ color: 'blue' }}
            // width="30rem"
            clear
            icon="user"
            label="Date input"
            error="Warning..."
          />
          <Component
            component="MaskedInput"
            dataid="birthday"
            loc={{ col: 4, row: 1 }}
            clear
            // style={{ width: '20rem' }}
            icon="user"
            info="user"
            label="Masked input"
            type="date"
          />
        </Section>
        <Panel
          title="Section #AAA"
          loc={{ col: 1, row: 3 }}
          layout={{ cols: 4, rows: 2 }}>
          <Component
            component="Input"
            dataid="last"
            loc={{ col: 1, row: 1 }}
            clear
            icon="user"
            info="tint"
            label="Last name"
            message="Testing it"
          />
          <Component
            component="Checkbox"
            dataid="active"
            loc={{ col: 2, row: 1 }}
            //toggle
            intent="success"
            label="Hello"
            text="A Boolean attribute indicating whether or not this checkbox is checked by default (when the page loads). It does not indicate whether this checkbox is currently checked:"
          />
          <Component
            component="MultiSelect"
            dataid="films"
            loc={{ col: 3, row: 1 }}
            label="Select Movie"
            icon="user"
            //minimal
            //iconOnly
            clear
            search
            //filterBy="title"
            error="Not nice error"
            display={(item) => `${item.title}, ${item.year}`}
          />
          <Component
            component="Cascade"
            loc={{ col: 1, row: 2, colSpan: 3 }}
            dataid="costCenter"
            label="Operation"
            labels={['Cost center', 'Account', 'Sub-Account']}
            display="name"
            //minimal
            horizontal
            icon="user"
            clear
            search
            filterBy="title"
          />
          <Component
            component="Info"
            loc={{ col: 4, row: 1 }}
            text="Select Movies"
          />
          <Component
            component="TextArea"
            dataid="comment"
            loc={{ col: 4, row: 2 }}
            intent="success"
            label="Comment"
            debounce={600}
            clear
            rows={5}
          />
        </Panel>
        <Tabs id="tabList" title="Tabs" loc={{ col: 1, row: 4 }}>
          <Tabs.Tab
            id="1"
            title="First"
            layout={{ cols: 2, rows: 2 }}>
            <Component
              component="Radio"
              id="film1"
              dataid="film"
              loc={{ col: 1, row: 1 }}
              //horizontal
              label="Select Movie"
              display="title"
            />
          </Tabs.Tab>
          <Tabs.Tab
            id="2"
            title="Second"
            dataid="address"
            layout={{ cols: 1, rows: 2 }}>
            <Component
              component="Input"
              dataid="first"
              //style={{ width: '42rem' }}
              icon="times"
              intent="warning"
              label="Label two"
            />
          </Tabs.Tab>
          <Tabs.Tab
            id="3"
            title="Third one"
            layout={{ cols: 1, rows: 4 }}>
            <Component
              component="TextArea"
              dataid="comment"
              loc={{ col: 1, row: 1, colSpan: 2 }}
              intent="success"
              label="Comment"
              debounce={600}
              clear
              rows={5}
            />
          </Tabs.Tab>
        </Tabs>
      </Form>
      <h3>hello</h3>
    </>
  );
};

First11.propTypes = {
  def: PropTypes.object,
  rest: PropTypes.object,
};

export default First11;
