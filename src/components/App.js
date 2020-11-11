import React from 'react'
import {Router, Route} from 'react-router-dom'
import {connect} from 'react-redux'

import './App.css'

import history from '../history'
import SetUp from './set-up/SetUp'
import ListingScreen from './list/ListingScreen'

class App extends React.Component{

    render(){
        return(
            <div className="app">
                <Router history={history}> 
                    <>
                        <Route path="/setup" exact component={SetUp}/>
                        <Route path="/listing" exact component={ListingScreen}/>
                    </>
                </Router>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return{
        databaseFulled: state.db.databaseFulled
    }
}

export default connect(mapStateToProps)(App)