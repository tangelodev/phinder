import React from 'react'
import {connect} from 'react-redux'
import { Form, Field } from 'react-final-form'

import './SetUp.css'

import {ReactComponent as Logo} from './big-logo.svg'
import {ReactComponent as EnterIcon} from './enter-icon-transparent.svg'
import ProgressBar from './ProgressBar'

import {loadAll, setDatabase, getSubmissionsAmount} from '../../actions/filldb'

class SetUp extends React.Component{
    constructor(){
        super()
        this.state = {
            inputVisible: true,
            author: null
        }
    }

    componentDidMount(){
        this.props.setDatabase()
    }

    loadAll = () => {
        console.log(this.props.databaseSetted);
        
        if (this.props.databaseSetted === true) {
            this.props.loadAll()
        }        
    }

    buttonPress = () => {
        this.setState({inputVisible:  false})
        this.loadAll()
    }

    onSubmit = ({usernameInput: author}) => {
        //this.props.getSubmissionsAmount(author)
        this.setState({author})
        this.setState({inputVisible:  false})
                       
        if (this.props.databaseSetted === true) {
            //this.props.loadAll(author)
        }        
    }

    render(){
        return(
            <div>
                <Logo className="logo"/>
                
                <Form onSubmit={this.onSubmit}>
                    {({handleSubmit}) => (
                        <form onSubmit={handleSubmit} >
                            <div className="input-name">
                                <Field name="usernameInput" type="text" >
                                    {({input, meta}) => (
                                        <>
                                            <input {...input} className={`login-input ${this.state.inputVisible ? 'visible' : 'hidden'}`} autoComplete="off" spellCheck="false" placeholder="Please, enter your name" />
                                        </>
                                    )}
                                </Field>

                                <Field name="handleSubmitButton">
                                    {({input, meta}) => (
                                        <>
                                            <EnterIcon {...input} className={`enter-icon ${this.state.inputVisible ? 'visible' : 'hidden'}`} onClick={handleSubmit} />
                                        </>
                                    )}
                                </Field>
                            </div>
                        </form>
                    )}
                </Form>
                {!this.state.inputVisible ?
                    <ProgressBar author={this.state.author}/> :
                    null
                }

                
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        comments: Object.values(state.db.comments),
        databaseSetted: state.db.databaseSetted
    }
}

export default connect(mapStateToProps, {loadAll, setDatabase, getSubmissionsAmount})(SetUp)