import React from 'react'
import {connect} from 'react-redux'

import './Filler.css'
import history from '../../history'


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

export default connect()(Filler)