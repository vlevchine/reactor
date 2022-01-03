export { default as Header } from './header';
export { default as Brand } from './brand';
import HM from './home';
import Err from './error';
import NF from './notFound';
import Imp from '@app/shell/impersonate';

const Home = (props) => (
    <main className="app-main fade-in">
      <HM {...props} />
    </main>
  ),
  Error = (props) => (
    <main className="app-main fade-in">
      <Err {...props} />
    </main>
  ),
  NotFound = (props) => (
    <main className="app-main fade-in">
      <NF {...props} />
    </main>
  ),
  Impersonate = (props) => (
    <main className="app-main" fade-in>
      <Imp {...props} />
    </main>
  );

export { Error, NotFound, Home, Impersonate };
