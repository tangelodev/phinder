import {combineReducers} from 'redux'

import filldbReducer from './filldbReducer'
import listdbReducer from './listdbReducer'

export default combineReducers({
    db: filldbReducer, //this names reducer is too generic, needs renaming ASAP, ...everything else also needs renaming, I have failed my beliefs
    listing: listdbReducer
})