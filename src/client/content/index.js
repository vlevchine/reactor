import { wrapPage } from '@app/helpers';
import Messageboard, {config as config_Messageboard} from './headerLinks/messageboard';
import Preferences, {config as config_Preferences} from './headerLinks/preferences';
import About, {config as config_About} from './headerLinks/about';
import WellList, {config as config_WellList} from './wellList';
import First11, {config as config_First11} from './group1/first1/first11';
import First12, {config as config_First12} from './group1/first1/first12';
import First13, {config as config_First13} from './group1/first1/first13';
import First2, {config as config_First2} from './group1/first2';
import First_2, {config as config_First_2} from './group1/first_2';
import First3, {config as config_First3} from './group1/first3';
import Sec1, {config as config_Sec1} from './group3/sec1';
import Sec2, {config as config_Sec2} from './group3/sec2';
import Sec3, {config as config_Sec3} from './group3/sec3';
import Admin, {config as config_Admin} from './_admin';
import Prefs, {config as config_Prefs} from './admin/prefs';
import Users, {config as config_Users} from './admin/users';
import ProcDefs, {config as config_ProcDefs} from './dev/procDefs';
import FormDefs, {config as config_FormDefs} from './dev/formDefs';
import Types, {config as config_Types} from './dev/types';
import Lookups, {config as config_Lookups} from './dev/lookups';
import Play, {config as config_Play} from './dev/play';
import Well, {config as config_Well} from './well';
import TaskTemplate, {config as config_TaskTemplate} from './taskTemplate';

const content = {

Messageboard: wrapPage(Messageboard, config_Messageboard), Preferences: wrapPage(Preferences, config_Preferences), About: wrapPage(About, config_About), WellList: wrapPage(WellList, config_WellList), First11: wrapPage(First11, config_First11), First12: wrapPage(First12, config_First12), First13: wrapPage(First13, config_First13), First2: wrapPage(First2, config_First2), First_2: wrapPage(First_2, config_First_2), First3: wrapPage(First3, config_First3), Sec1: wrapPage(Sec1, config_Sec1), Sec2: wrapPage(Sec2, config_Sec2), Sec3: wrapPage(Sec3, config_Sec3), Admin: wrapPage(Admin, config_Admin), Prefs: wrapPage(Prefs, config_Prefs), Users: wrapPage(Users, config_Users), ProcDefs: wrapPage(ProcDefs, config_ProcDefs), FormDefs: wrapPage(FormDefs, config_FormDefs), Types: wrapPage(Types, config_Types), Lookups: wrapPage(Lookups, config_Lookups), Play: wrapPage(Play, config_Play), Well: wrapPage(Well, config_Well), TaskTemplate: wrapPage(TaskTemplate, config_TaskTemplate)

};

export default content;