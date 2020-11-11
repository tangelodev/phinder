import {
    FETCH_ALL_COMMENTS,
    CLEAN_COMMENTS_LIST,
    CHANGE_SCROLL_ACTIVE,
    SET_SORTING_BY,
    SET_FINDING_BY_STRING
} from '../actions/types'

const INITIAL_STATE = {
    comments: [],
    amountPages: null,
    scrollActive: false,
    findingByString: null,
    sortingBy: "date"
}

export default (state = INITIAL_STATE, action) => {
    
    switch (action.type) {
        case FETCH_ALL_COMMENTS:        
            return {...state, comments: [...state.comments, ...action.payload] }
        case CHANGE_SCROLL_ACTIVE:
            return {...state, scrollActive: action.payload }
        case CLEAN_COMMENTS_LIST:
            return {...state, comments: []}
        case SET_SORTING_BY:
            return {...state, sortingBy: action.payload}
        case SET_FINDING_BY_STRING:
            return {...state, findingByString: action.payload}
        default:
            return state
    }
}
