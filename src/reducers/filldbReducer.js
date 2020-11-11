import {
    FETCH_REDDIT_PAGE,
    GET_SUBMISSIONS_AMOUNT,
    FETCH_SUBMISSIONS_AMOUNT_DB,
    SET_DATABASE,
    FILL_DATABASE,
    WIPE_DATABASE
} from '../actions/types'

const INITIAL_STATE = {
    comments: [],
    totalSubmissions: 0,
    progressCount: 0,
    databaseSetted: false,
    databaseFull: false
}

export default (state = INITIAL_STATE, action) => {
    
    switch (action.type) {
        case FETCH_REDDIT_PAGE:
            return {...state, comments: action.payload }
        case GET_SUBMISSIONS_AMOUNT:
            return {...state, totalSubmissions: action.payload }
        case FETCH_SUBMISSIONS_AMOUNT_DB:
            return {...state, progressCount: action.payload }
        case SET_DATABASE:
            return {...state, databaseSetted: action.payload }
        case FILL_DATABASE:
            return {...state, databaseFull: action.payload }
        case WIPE_DATABASE:
            return {...state}
        default:
            return state
    }
}
