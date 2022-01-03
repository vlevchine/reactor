import { wrapPage } from '@app/helpers';
import Assets_WellList, {config as config_Assets_WellList} from './assets/wellList';
import Assets_Rigs, {config as config_Assets_Rigs} from './assets/rigs';
import Assets_Personnel, {config as config_Assets_Personnel} from './assets/personnel';
import Group1_First2, {config as config_Group1_First2} from './group1/first2';
import Group1_First_2, {config as config_Group1_First_2} from './group1/first_2';
import Group1_First3, {config as config_Group1_First3} from './group1/first3';
import Group3_Sec1, {config as config_Group3_Sec1} from './group3/sec1';
import Group3_Sec2_First11, {config as config_Group3_Sec2_First11} from './group3/sec2/first11';
import Group3_Sec2_First12, {config as config_Group3_Sec2_First12} from './group3/sec2/first12';
import Group3_Sec2_First13, {config as config_Group3_Sec2_First13} from './group3/sec2/first13';
import Group3_Sec3, {config as config_Group3_Sec3} from './group3/sec3';
import Activities_Afe, {config as config_Activities_Afe} from './activities/afe';
import Activities_Rtd, {config as config_Activities_Rtd} from './activities/rtd';
import Activities_Construction, {config as config_Activities_Construction} from './activities/construction';
import Activities_Drilling, {config as config_Activities_Drilling} from './activities/drilling';
import Activities_Completion, {config as config_Activities_Completion} from './activities/completion';
import Activities_Suspension, {config as config_Activities_Suspension} from './activities/suspension';
import Admin_Users, {config as config_Admin_Users} from './admin/users';
import Admin_Companies, {config as config_Admin_Companies} from './admin/companies';
import Admin_UserGroups, {config as config_Admin_UserGroups} from './admin/userGroups';
import Admin_CostCenters, {config as config_Admin_CostCenters} from './admin/costCenters';
import Dev_Ogc_Afe, {config as config_Dev_Ogc_Afe} from './dev/ogc/afe';
import Dev_Ogc_Rtd, {config as config_Dev_Ogc_Rtd} from './dev/ogc/rtd';
import Dev_Ogc_Drilling, {config as config_Dev_Ogc_Drilling} from './dev/ogc/drilling';
import Dev_Ogc_Completion, {config as config_Dev_Ogc_Completion} from './dev/ogc/completion';
import Dev_Ogc_Suspension, {config as config_Dev_Ogc_Suspension} from './dev/ogc/suspension';
import Dev_Homes_Construction, {config as config_Dev_Homes_Construction} from './dev/homes/construction';
import Dev_Homes_Reno, {config as config_Dev_Homes_Reno} from './dev/homes/reno';
import Dev_ProcDefs, {config as config_Dev_ProcDefs} from './dev/procDefs';
import Dev_FormEditor, {config as config_Dev_FormEditor} from './dev/formEditor';
import Dev_Types, {config as config_Dev_Types} from './dev/types';
import Dev_Lookups, {config as config_Dev_Lookups} from './dev/lookups';
import Dev_Play, {config as config_Dev_Play} from './dev/play';
import Well, {config as config_Well} from './parameterized/well';
import TaskTemplate, {config as config_TaskTemplate} from './parameterized/taskTemplate';
import Group1_First1_First11, {config as config_Group1_First1_First11} from './group1/first1/first11';
import Group1_First1_First12, {config as config_Group1_First1_First12} from './group1/first1/first12';
import Group1_First1_First13, {config as config_Group1_First1_First13} from './group1/first1/first13';
import Dev_Ogc_Construction_Workflows, {config as config_Dev_Ogc_Construction_Workflows} from './dev/ogc/construction/workflows';
import Dev_Ogc_Construction_Roles, {config as config_Dev_Ogc_Construction_Roles} from './dev/ogc/construction/roles';
import Dev_Ogc_Construction_Lookups, {config as config_Dev_Ogc_Construction_Lookups} from './dev/ogc/construction/lookups';
import Dev_Ogc_Construction_Types, {config as config_Dev_Ogc_Construction_Types} from './dev/ogc/construction/types';

const content = {

Assets_WellList: wrapPage(Assets_WellList, config_Assets_WellList), Assets_Rigs: wrapPage(Assets_Rigs, config_Assets_Rigs), Assets_Personnel: wrapPage(Assets_Personnel, config_Assets_Personnel), Group1_First2: wrapPage(Group1_First2, config_Group1_First2), Group1_First_2: wrapPage(Group1_First_2, config_Group1_First_2), Group1_First3: wrapPage(Group1_First3, config_Group1_First3), Group3_Sec1: wrapPage(Group3_Sec1, config_Group3_Sec1), Group3_Sec2_First11: wrapPage(Group3_Sec2_First11, config_Group3_Sec2_First11), Group3_Sec2_First12: wrapPage(Group3_Sec2_First12, config_Group3_Sec2_First12), Group3_Sec2_First13: wrapPage(Group3_Sec2_First13, config_Group3_Sec2_First13), Group3_Sec3: wrapPage(Group3_Sec3, config_Group3_Sec3), Activities_Afe: wrapPage(Activities_Afe, config_Activities_Afe), Activities_Rtd: wrapPage(Activities_Rtd, config_Activities_Rtd), Activities_Construction: wrapPage(Activities_Construction, config_Activities_Construction), Activities_Drilling: wrapPage(Activities_Drilling, config_Activities_Drilling), Activities_Completion: wrapPage(Activities_Completion, config_Activities_Completion), Activities_Suspension: wrapPage(Activities_Suspension, config_Activities_Suspension), Admin_Users: wrapPage(Admin_Users, config_Admin_Users), Admin_Companies: wrapPage(Admin_Companies, config_Admin_Companies), Admin_UserGroups: wrapPage(Admin_UserGroups, config_Admin_UserGroups), Admin_CostCenters: wrapPage(Admin_CostCenters, config_Admin_CostCenters), Dev_Ogc_Afe: wrapPage(Dev_Ogc_Afe, config_Dev_Ogc_Afe), Dev_Ogc_Rtd: wrapPage(Dev_Ogc_Rtd, config_Dev_Ogc_Rtd), Dev_Ogc_Drilling: wrapPage(Dev_Ogc_Drilling, config_Dev_Ogc_Drilling), Dev_Ogc_Completion: wrapPage(Dev_Ogc_Completion, config_Dev_Ogc_Completion), Dev_Ogc_Suspension: wrapPage(Dev_Ogc_Suspension, config_Dev_Ogc_Suspension), Dev_Homes_Construction: wrapPage(Dev_Homes_Construction, config_Dev_Homes_Construction), Dev_Homes_Reno: wrapPage(Dev_Homes_Reno, config_Dev_Homes_Reno), Dev_ProcDefs: wrapPage(Dev_ProcDefs, config_Dev_ProcDefs), Dev_FormEditor: wrapPage(Dev_FormEditor, config_Dev_FormEditor), Dev_Types: wrapPage(Dev_Types, config_Dev_Types), Dev_Lookups: wrapPage(Dev_Lookups, config_Dev_Lookups), Dev_Play: wrapPage(Dev_Play, config_Dev_Play), Well: wrapPage(Well, config_Well), TaskTemplate: wrapPage(TaskTemplate, config_TaskTemplate), Group1_First1_First11: wrapPage(Group1_First1_First11, config_Group1_First1_First11), Group1_First1_First12: wrapPage(Group1_First1_First12, config_Group1_First1_First12), Group1_First1_First13: wrapPage(Group1_First1_First13, config_Group1_First1_First13), Dev_Ogc_Construction_Workflows: wrapPage(Dev_Ogc_Construction_Workflows, config_Dev_Ogc_Construction_Workflows), Dev_Ogc_Construction_Roles: wrapPage(Dev_Ogc_Construction_Roles, config_Dev_Ogc_Construction_Roles), Dev_Ogc_Construction_Lookups: wrapPage(Dev_Ogc_Construction_Lookups, config_Dev_Ogc_Construction_Lookups), Dev_Ogc_Construction_Types: wrapPage(Dev_Ogc_Construction_Types, config_Dev_Ogc_Construction_Types)

};

export default content;