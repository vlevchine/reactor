import { appState } from '@app/services';
import { Alert } from '@app/components/core';
import '@app/App.css';
import {
  CardStack,
  TagInput,
  SplitButton,
} from '@app/components/core';
import {
  MultiSelect,
  DateInput,
  FormControl,
  Fieldset,
} from '@app/components/core/tagInput';
import { PropTypes } from 'prop-types';

const msg =
    'To simulate enterprise environment, this application provides a predefined company and a set of uers.',
  msg1 =
    'To access the application, please login with your Google account and then impersonate with one of the users.',
  msg2 = 'Please, impersonate with one of the users.',
  msg3 = 'You can impersonate with any other user.';

Home.propTypes = {
  config: PropTypes.object,
};
export default function Home({ config }) {
  const auth = appState.auth.get(),
    signedIn = auth.social,
    info = `${msg} ${!signedIn ? msg1 : auth.user ? msg3 : msg2}`;

  return (
    <div
      style={{
        display: ' grid',
        gridAutoFlow: 'row',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
      }}>
      <Alert type="info" text={info} />
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
        // value={new Date()}
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
      {/* iconOnly */}
      <SplitButton
        spec={config.menu[4]}
        id="sewl1"
        display="label"
        intent="info"
        // dir="down"
        size="lg"
      />
      <p>
        It’s therefore curious that learning about DSLs is usually
        confined to the more challenging parts of university Computer
        Science curricula. I find that books available on the market
        either assume too much prior Computer Science knowledge, are
        not practical enough, rely on a very specific piece of
        technology, or any combination of those. This book is the
        result of the desire to try and fix that situation. It’s my
        goal to make the topic of DSLs -and slightly more general:
        that of software language engineering- accessible to an
        audience that’s as broad as possible. Let me take you on a
        guided tour through the essentials of the field. We start with
        the oh-so-important “What?” and “Why (not)?” questions, and
        finish on a full-blown DSL environment or Domain IDE, with
        narrated stopovers along the way at topics such as: • Concrete
        versus abstract syntax • Abstract Syntax Trees • Crafting a
        user-friendly Web-based editor • Code generation • Business
        rules: definition and execution As an encore, we’ll also
        address the “What else?”-question. This book “cheats” by not
        crafting parser-based textual DSLs, but rather ones that use
        projectional editing. Not only is parsing technology hard to
        master, but the resulting DSLs tend to have a rather “techy”
        look and feel about them. Projectional DSLs look and feel more
        like a modern business app, and are conceptually,
        architecturally, and technogically much simpler. I’m afraid
        you’ll have to look elsewhere if you really wanted to learn
        about grammars, scanners/lexers, etc…This books covers a lot
        of common ground though: much of the content applies directly
        to the parsing-based world as well, or has a conceptual
        equivalent. Writing this book has been quite the learning
        experience, and I hope it will be equally rewarding for you.
        Don’t be shy to post questions, and feedback in the
        liveBook&apos;s Discussion Forum. Not only will you benefit
        from that, but also me, and by extension, your fellow readers.
        — Meinte Boersma
      </p>
    </div>
  );
}
