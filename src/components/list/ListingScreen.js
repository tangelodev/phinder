import React from 'react'
import {connect} from 'react-redux'
import './ListingScreen.css'

import List from './List'
import SearchBar from './SearchBar'

import { changeScrollActive } from '../../actions/listdb'


class ListingScreen extends React.Component{
    render(){
        return(
            <>
                <div className="background">           
                    <div className="background-breaker">
                        <SearchBar />
                        <List />
                    </div>
                </div>
            </>
        )
    }
}

export default connect(null, {changeScrollActive})(ListingScreen)