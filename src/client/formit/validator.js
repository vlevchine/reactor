import { Observable, Status } from '@app/utils/observable';

const validationStatuses = ['pristine', 'error', 'success'],
  okStatus = ['pristine', 'success'],
  nulls = ['', undefined];

export default class Validator extends Observable {
  constructor(name) {
    super(name);
    this.status = new Status(validationStatuses);
    this.data = { required: [] };
  }
  isPristine() {
    return this.status.isZero();
  }
  isOK() {
    return okStatus.includes(this.status.name);
  }
  isValid() {
    return this.status.name === 'success';
  }
  setStatus() {
    this.status.name = this.data.required.length
      ? 'error'
      : 'success';
    return this.status;
  }
  checkRequired(v, id) {
    const ind = this.data.required.indexOf(id);
    if (nulls.includes(v)) {
      ind < 0 && this.data.required.push(id);
    } else if (ind > -1) this.data.required.splice(ind, 1);
    this.onSuccess(this.setStatus());
  }
  checkUnique() {
    // const modelNames = _.unique(v.model, 'name');
    // if (modelNames.length < v.model.length)
    //   toaster.danger('Duplicate model property name.');
  }
  checkShape() {}
  validate(fields, data) {
    //required fields
    fields.forEach((f) =>
      this.checkRequired(data[f.dataid], f.dataid)
    );
    //shapes, etc.
    this.onSuccess(this.setStatus());
  }
  reset() {
    this.data = { required: [] };
    this.status.value(0);
  }
}
