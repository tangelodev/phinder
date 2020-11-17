import React from 'react'
import {connect} from 'react-redux'

import './Filler.css'

class Filler extends React.Component{

    render(){
        console.log('Percentage completed: ' + this.props.percentage.toFixed(2));
        return(
            <div className="filler" style={{width: `${this.props.percentage}%`}}/>
        )
    }
}

export default connect()(Filler)