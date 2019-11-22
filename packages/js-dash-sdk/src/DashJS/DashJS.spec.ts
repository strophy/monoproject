import { expect } from 'chai';
import {DashJS} from "./index";
import 'mocha';

describe('DashJS', () => {

  it('should provide expected class', function () {
    expect(DashJS).to.have.property('SDK');
    expect(DashJS.SDK.name).to.be.equal('SDK')
    expect(DashJS.SDK.constructor.name).to.be.equal('Function')
  });
});
