import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as TitleBarContainer } from './TitleBarContainer';
import { mount } from 'enzyme';
var moment = require('moment');
import sinon from 'sinon';
// import ReactTestUtils from 'react-addons-test-utils';

const emptyFunc = () => {
  // This is intentional
};
const emptyObj = {
  // This is intentional
};

describe('(Component) TitleBarContainer', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TitleBarContainer actions={emptyObj} adagucProperties={emptyObj} dispatch={emptyFunc} routes={[ { path: 'testpath' } ]} />);
  });
  it('Renders nested routes', () => {
    _component = mount(<TitleBarContainer actions={emptyObj} adagucProperties={emptyObj} dispatch={emptyFunc} routes={[
      { path: 'testpathA', indexRoute: { title: 'testpathAtitle' } },
      { path: 'testpathB', indexRoute: { title: 'testpathBtitle' } },
      { path: 'testpathC', indexRoute: { title: 'testpathCtitle' } }
    ]} />);
    expect(_component.type()).to.eql(TitleBarContainer);
  });
  it('Renders a TitleBarContainer', () => {
    expect(_component.type()).to.eql(TitleBarContainer);
  });
  it('Renders initially with the current time', () => {
    const currentTime = moment.utc().format('YYYY MMM DD - HH:mm').toString();
    expect(_component.state().currentTime).to.equal(currentTime);
  });
  it('Calls the login function when the login button is clicked', () => {
    _component.doLogin = sinon.spy();
    _component.toggleLoginModal = sinon.spy();
    const loginComponent = _component.find('#loginIcon');
    expect(loginComponent.length).to.equal(1);
    loginComponent.simulate('click');
    _component.doLogin.should.have.been.calledOnce;
    _component.toggleLoginModal.should.have.been.calledOnce;
  });

  it('Checks setLoggedOut method', () => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer
        actions={{ logout:_logoutaction }}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
     );
    _component.instance().setLoggedOutCallback('testmessage');
    expect(_component.state().loginModalMessage).to.equal('testmessage');
    expect(_component.instance().inputfieldUserName).to.equal('');
    expect(_component.instance().inputfieldPassword).to.equal('');
    _logoutaction.should.have.been.calledOnce;
  });

  it('Checks checkCredentialsOKCallback method with user test', () => {
    const _loginaction = sinon.spy();
    _component = mount(
      <TitleBarContainer
        actions={{ login:_loginaction }}
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
     );
    _component.instance().checkCredentialsOKCallback({ userName:'test' });
    expect(_component.state().loginModal).to.equal(false);
    expect(_component.state().loginModalMessage).to.equal('Signed in as user test');
    _loginaction.should.have.been.calledOnce;
  });

  it('Checks checkCredentialsBadCallback', () => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer
        actions={{ logout:_logoutaction }}
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
     );
    _component.instance().checkCredentialsBadCallback({
      response:{
        data:{
          message:'invalid_user'
        }
      }
    });
    expect(_component.state().loginModalMessage).to.equal('invalid_user');
    _logoutaction.should.have.been.calledOnce;
  });

  it('Checks checkCredentialsOKCallback method with invalid username \'\' ', () => {
    _component = mount(
      <TitleBarContainer
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
     );
    _component.instance().checkCredentialsOKCallback({ userName:'' });
    expect(_component.state().loginModalMessage).to.equal('Unauthorized');
  });

  it('Checks if logout method works and if logout action is triggered once', () => {
    const _logoutaction = sinon.spy();
    _component = mount(
      <TitleBarContainer
        actions={{ logout:_logoutaction }}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
     );
    _component.instance().doLogout();
    expect(_component.instance().inputfieldUserName).to.equal('');
    expect(_component.instance().inputfieldPassword).to.equal('');
    _logoutaction.should.have.been.calledOnce;
  });

  it('Calls the setTime function and checks wheter state is updated', () => {
    _component = mount(
      <TitleBarContainer
        actions={emptyObj}
        adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
        dispatch={emptyFunc}
        routes={[ { path: 'testpath' } ]}
      />
    );
    const currentTime = moment.utc().format('YYYY MMM DD - HH:mm').toString();
    _component.instance().setTime();
    expect(_component.state().currentTime).to.equal(currentTime);
  });
  it('Calls the logout function when the logout button is clicked', () => {
    // _component = mount(<TitleBarContainer
    //   loginModal={!false}
    //   actions={emptyObj}
    //   adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
    //   dispatch={emptyFunc}
    //   routes={[ { path: 'testpath' } ]}
    // />);
    // _component = ReactTestUtils.renderIntoDocument(
    //   <TitleBarContainer
    //     loginModal={!false}
    //     actions={emptyObj}
    //     adagucProperties={{ user: { isLoggedIn: true, userName: 'Blah' } }}
    //     dispatch={emptyFunc}
    //     routes={[ { path: 'testpath' } ]}
    //   />
    // );
    // // _component.doLogout = sinon.spy();
    // // _component.doLogout();
    // // const loginComponent = _component.find('#loginIcon');
    // // loginComponent.simulate('click');
    // console.log(_component.portal);
    // console.log(_component);
    // const logoutComponent = ReactTestUtils.findRenderedDOMComponentWithClass(_component, 'signInOut');
    // console.log(logoutComponent);
    // expect(logoutComponent.length).to.equal(1);
    // logoutComponent.simulate('click');
    // _component.doLogout.should.have.been.calledOnce;
  });
});