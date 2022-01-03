import { _ } from '@app/helpers';

const _power = 'power',
  devRoles = [_power, 'dev'],
  adminRoles = [_power, 'admin'],
  userExt = {
    inRole(role) {
      return this.roles.includes(role);
    },
    inRoles(roles) {
      return _.intersect(this.roles, roles);
    },
    isAdmin() {
      return this.inRoles(adminRoles);
    },
    isOwner() {
      return !!this.logged?.provider;
    },
    isDev() {
      return this.inRoles(devRoles);
    },
    isImpersonating() {
      return this.username !== this.logged.username;
    },
    authorized(guard) {
      if (!guard || this.inRole(_power)) return true;
      const { inRole, offRole } = guard;
      return inRole
        ? this.inRoles(inRole)
        : offRole
        ? !this.inRoles(offRole)
        : true;
    },
  },
  getUser = (session = {}) => {
    const { user, company, ...logged } = session,
      usr = Object.assign({ roles: [], logged }, user, userExt);
    usr.company = company;
    return usr;
  };

export { getUser };
