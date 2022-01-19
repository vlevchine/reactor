import PropTypes from 'prop-types';
import {
  Button,
  AddButton,
  CardStack,
  TagInput,
  MultiSelect,
  DateInput,
  SplitButton,
  MenuMore,
} from '@app/components/core';
import { FormControl, Fieldset } from '@app/formit';

//page-specifc config
export const config = {};

Play.propTypes = {
  def: PropTypes.object,
  config: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Play({ config: conf, ctx }) {
  var drillCo = ctx.lookups.drillingCompany,
    costs = ctx.lookups.costCenters,
    getOptions = ({ id, start = '', limit = 10 }) => {
      const lk = ctx.lookups[id],
        items = lk.items,
        fltr = start.toLowerCase(),
        res = [];
      for (let i in items) {
        if (items[i].name.toLowerCase().startsWith(fltr))
          res.push(items[i]);
        if (res.length >= limit) break;
      }
      return Promise.resolve(res);
    };

  return (
    <>
      <CardStack title="Card Stack">
        <CardStack.Card
          //titleUnderline
          title="Card1">
          <p>
            Thank you for purchasing the MEAP for Domain-Specific
            Languages Made Easy! This book is written for developers
            interested in unlocking the potential of Domain-Specific
            Languages (DSLs) to improve their daily software
            development life. Code generation • Business rules:
            definition and execution As an encore, we’ll also address
            the “What else?”-question. This book “cheats” by not
            crafting parser-based textual DSLs, but rather ones that
            use projectional editing. Not only is parsing technology
            hard to master, but the resulting DSLs tend to have a
            rather “techy” look
          </p>
        </CardStack.Card>
        <CardStack.Card
          //titleUnderline
          title="Card2">
          <p>
            Thank you for purchasing the MEAP for Domain-Specific
            Languages Made Easy! This book is written for developers
            interested in unlocking the potential of Domain-Specific
            Languages (DSLs) to improve their daily software
          </p>
        </CardStack.Card>
        <CardStack.Card
          //titleUnderline
          title="Card3">
          <p>
            Thank you for purchasing the MEAP for Domain-Specific
            Languages Made Easy! This book is written for developers
            interested in unlocking the potential o
          </p>
        </CardStack.Card>
      </CardStack>
      <div className="flex-row">
        <Button
          prepend="filter"
          minimal
          size="lg"
          intent="info"
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save1"
          //intent="primary"
          minimal
          size="lg"
          //  disabled
        />
      </div>
      <div className="flex-row">
        <Button
          prepend="save"
          text="Normal"
          style={{ margin: '1rem' }}
          //  disabled
        />
        <Button
          prepend="save"
          text="Normal"
          size="sm"
          style={{ margin: '1rem' }}
          // disabled
        />
        <Button
          prepend="save"
          text="Save4"
          intent="secondary"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Info"
          intent="info"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save6"
          className="danger"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="Save7"
          intent="success"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          //disabled
        />
        <Button
          prepend="save"
          text="Save8"
          className="success"
          style={{ margin: '1rem' }}
          tooltip="Set filters"
          disabled
        />
      </div>
      <div className="flex-row">
        <Button
          prepend="save"
          text="I_Normal"
          className="invert primary"
          //  minimal
          size="lg"
          //  disabled
        />
        <Button
          prepend="save"
          text="I_Normal"
          intent="primary"
          className="invert"
          //  disabled
        />
        <Button
          prepend="save"
          text="I_Normal"
          className="invert primary"
          size="sm"
          //  disabled
        />
        <Button
          prepend="save"
          text="I_Secondary"
          className="invert secondary"
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="I_Info"
          intent="info"
          className="invert"
          tooltip="Set filters"
          //  disabled
        />
        <Button
          prepend="save"
          text="I_Success"
          intent="success"
          className="invert"
          //minimal
          // tooltip="Set filters"
          disabled
        />
      </div>
      <div className="flex-row">
        <Button
          className="clip-icon before close danger invert"
          text="Remove"
          style={{ margin: '1rem' }}
        />
        <Button
          className="clip-icon before close info"
          text="Remove"
          //  style={{ margin: '1rem' }}
        />
        <Button
          className="clip-icon before close success"
          text="Remove"
          //   style={{ margin: '1rem' }}
          disabled
        />
        <AddButton />
      </div>
      <div
        style={{
          display: ' grid',
          gridAutoFlow: 'row',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}>
        <TagInput
          id="tag"
          label="Please, enter"
          value={[
            { id: '1', name: 'hi' },
            { id: '2', name: 'hello' },
          ]}
          uncontrolled
          clear
          // readonly //noAdding
          //initials
          //intent="info"
          // underline
          prepend="user"
          // append="check"
        />
        <br />
        <DateInput
          prepend="user"
          label="Date"
          locale="en-US"
          clear
          uncontrolled
          value={new Date()}
        />
        <FormControl
          type="Select"
          message="Is it valid?"
          id="sewl"
          label="Please, select"
          display="name"
          prepend="user"
          intent="danger"
          value="2"
          options={[
            { id: '1', name: 'hi' },
            { id: '2', name: 'hello' },
          ]}
          style={{ width: '20rem' }}
          clear
          uncontrolled
        />
        {/*<FormControl
          type="SelectTree"
          message="Is it tree?"
          id="tree"
          label="Select in tree"
          display="label"
          prepend="user"
          // intent="danger"
          // value="2"
          options={conf.menu}
          style={{ width: '30rem' }}
          clear
          uncontrolled
        />*/}
        <FormControl
          type="Search"
          message="this is search?"
          id={drillCo.id}
          label="Search here"
          display="name"
          prepend="user"
          // intent="danger"
          // value="2"
          limit={5}
          getOptions={getOptions}
          style={{ width: '30rem' }}
          clear
          uncontrolled
        />
        <FormControl
          type="SearchCascader"
          message="this is search?"
          id={costs.id}
          label="Cost Center / Account #"
          spec={['costCenter', 'account']}
          display="name"
          prepend="user"
          // intent="danger"
          // value="2"
          limit={5}
          options={costs.items}
          //getOptions={getOptions}
          style={{ width: '30rem' }}
          clear
          uncontrolled
        />
        <Fieldset
          label="Choose your favorite monster"
          style={{ width: '30rem' }}>
          <MultiSelect
            id="mlt"
            label="Please, multi"
            prepend="user"
            value={['2']}
            options={[
              { id: '1', name: 'hi' },
              { id: '2', name: 'hello' },
            ]}
            clear
            uncontrolled
          />
        </Fieldset>
        <br />
        <SplitButton
          {...conf.menu[4]}
          text="New Project"
          display="label"
          //minimal
          intent="info"
          // openIcon="ellipsis-v"
          onClick={(_id, id) => console.log(_id, id)}
          //size="lg"
        />
        <FormControl
          type="TextInput"
          message="Input here"
          id="sewl4"
          label="Please, input"
          prepend="user"
          append="user"
          intent="danger"
          value="ert2"
          clear
          uncontrolled
        />
        <FormControl
          type="NumberInput"
          message="Input here"
          messageHint=",hell0, it's me,"
          id="sewl5"
          label="Please, number"
          hint="hell0, it's me on label"
          prepend="user"
          locale="en-US"
          intent="info"
          value={25}
          unit={{ type: 'weight' }}
          uom="I"
          clear
          uncontrolled
        />
        <MenuMore
          items={conf.menu[5].items}
          id="dev"
          display="label"
          // minimal
        />
        <FormControl
          type="InputMulti"
          id="approval"
          spec={[
            { id: 'lon', options: ['W', 'E'], scale: [-1, 1] },
            { id: 'lat', options: ['N', 'S'], scale: [1, -1] },
          ]}
          value={[-119.0536557, 54.05206435]}
          intent="info"
          label="Approval required"
          uncontrolled
          style={{ width: '20rem' }}
        />
      </div>
    </>
  );
}
