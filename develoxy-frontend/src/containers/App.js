import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as modal from 'redux/modules/base/modal'
// load components
import Header, {SidebarButton, BrandLogo, AuthButton} from 'components/Base/Header/Header';

import * as Modals from 'components/Base/Modals';
const { LoginModal, LinkAccountModal } = Modals;
const { SocialLoginButton } = LoginModal;

// import LoginModal, { SocialLoginButton } from 'components/Base/LoginModal/LoginModal';
// import LinkAccountModal from 'components/Base/LoginModal/LinkAccountModal';

import auth from 'helpers/firebase/auth';
import * as users from 'helpers/firebase/database/users';


class App extends Component {

    componentDidMount() {
        auth.authStateChanged(
            async (firebaseUser) => {
                if(firebaseUser) {
                    // 유저 데이터가 존재하는지 확인
                    const user = await users.findUserById(firebaseUser.uid);
                    if(!user.exists()) {
                        await users.createUserData(firebaseUser);
                    }
                    console.log('로그인이 됐다요', firebaseUser);
                } else {
                    console.log('로그인 안됐는데? 어쩔건데?')
                }
            }
        );
    }

    handleAuth = (provider) => {
        this.handleModal.close('login');
        auth[provider]().catch(
            error => {
                if(error.code === 'auth/account-exists-with-different-credential') {
                    this.handleModal.open({ 
                        modalName: 'linkAccount',
                        data: error
                    })
                    // auth.resolveDuplicate(error).then(
                    //     (response) => {console.log(response)}
                    // );
                }
            }
        );
    }
    
    handleModal =(() => {
        const { ModalActions } = this.props;
        return {
            open: ({modalName, data}) => {
                ModalActions.openModal({modalName, data});
            },
            close: (modalName) => {
                ModalActions.closeModal(modalName);
            }
        }
    })()

    

    render() {        
        const { children, status: {modal} } = this.props;
        const { handleAuth, handleModal } = this;

        return (
            <div>
                <Header>
                    <SidebarButton/>
                    <BrandLogo/>
                    <AuthButton onClick={() => handleModal.open({modalName: 'login'})}/>
                </Header>


                <LoginModal visible={modal.getIn(['login', 'open'])} onHide={ () => handleModal.close('login')}>
                    <SocialLoginButton onClick={() => handleAuth('github')} type="github"/>
                    <SocialLoginButton onClick={() => handleAuth('google')} type="google"/>
                    <SocialLoginButton onClick={() => handleAuth('facebook')} type="facebook"/>
                </LoginModal>

                <LinkAccountModal visible={modal.getIn(['linkAccount', 'open'])} onHide={()=>handleModal.close('linkAccount')}/>
                {/* 
                
                */}
                {children}
            </div>
        );
    }
}

App = connect(
    state => ({
        status: {
            modal: state.base.modal
            // something: state.something.get('something')
        }
    }),
    dispatch => ({
        ModalActions: bindActionCreators(modal, dispatch)
    })
)(App);

export default App;