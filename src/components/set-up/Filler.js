import React from 'react'
import {connect} from 'react-redux'

import './Filler.css'
import history from '../../history'

import {getSubmissionsAmount} from '../../actions/filldb'

class Filler extends React.Component{
    /*
    componentDidMount(){
        this.props.getSubmissionsAmount()
    }
    */

    renderPercentage(){
        if (!this.props.totalSubmissions) {
            return 0
        }
        const percentage = ( this.props.progressCount / this.props.totalSubmissions ) * 100
        
        if (percentage === 100) {
            history.push('/')
        } else {
            return percentage
        }
    }

    render(){
        console.log('Percentage completed: ' + this.renderPercentage().toFixed(2));
        return(
            <div className="filler" style={{width: `${this.renderPercentage()}%`}}/>
        )
    }
}

const mapStateToProps = (state) => {
    return{
        progressCount: state.db.progressCount,
        totalSubmissions: state.db.totalSubmissions
    }
}

export default connect(mapStateToProps, {getSubmissionsAmount})(Filler)