import {combineReducers} from 'redux'

import listdbReducer from './listdbReducer'

export default combineReducers({
    listing: listdbReducer
})