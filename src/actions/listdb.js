import db from '../api/nedb/db'

import {
    FETCH_ALL_COMMENTS,
    CLEAN_COMMENTS_LIST,
    CHANGE_SCROLL_ACTIVE,
    SET_SORTING_BY,
    SET_FINDING_BY_STRING
} from './types'

/*
Param: 
    A string with the words the user wants to search
Return: 
    A regex used by the db to find comments by body
Note: 
    The way that the regex works: looks up ahead the word, then returns to starting position, repeat for the next word
*/
const getSearchRegex = (findingByString) => {
    //Replaces multiple spaces with a single space
    const singleSpaces = findingByString.replace(/\s\s+/g, ' ');

    //Splits the string into an array by words
    const splitted = singleSpaces.split(' ')

    //Adds the regex parameter to each word
    const withRegex = splitted.map((word, i) => {
        return `(?=.*\\b${word}\\b)`
    })

    //Converts array into string
    const finalString = withRegex.join('')

    //Returns the string converted into regex
    return new RegExp(finalString, 'gi');
}

export const addCommentsToList = (findingByString, sortingBy, lastComment) => async (dispatch) => {

    dispatch(changeScrollActive(false))

    let sort = {}
    let find = {}
  
    if (sortingBy === "date") {
        sort = {created: -1}
        if (lastComment) {
            find = {...find, created: {$lt: lastComment.created}}
        }
    }
    else if(sortingBy === "relevance"){
        sort = {formattingPoints: -1}
        if (lastComment) {
            find = {...find, formattingPoints: {$lt: lastComment.formattingPoints}}
        }
    }
    else {
        sort = null
    }

    if (findingByString) {
        find = {...find, body: { $regex: getSearchRegex(findingByString)}}
    }

    let comments = []    

    if (sort !== null) {
        console.log("Search: ", find);
        
        comments = await db.find(find).sort(sort).limit('25')

        if (comments.length > 0) {
            dispatch(changeScrollActive(true))
        }
    }

    dispatch({
        type: FETCH_ALL_COMMENTS,
        payload: comments
    })
}

export const cleanCommentsList = () => {
    return{
        type: CLEAN_COMMENTS_LIST
    }
}

export const setSortingBy = (sortingBy) => {
    return{
        type: SET_SORTING_BY,
        payload: sortingBy
    }
}

export const setFindingByString = (findingByString) => {
    return{
        type: SET_FINDING_BY_STRING,
        payload: findingByString
    }
}

const calculatePageRank = async (linkId) => {    
    const res = await db.find({outboundLinks: {$elemMatch: linkId} }, {pageRank: 1, outboundLinks: 1})

    let sum = 0
    res.forEach((e) => {        
        sum += e.pageRank / e.outboundLinks.length
    })
    const d = 0.85
    let pageRank = 1 - d + d * sum

    return pageRank
}

export const fetchComments = () => async (dispatch) => {
    console.log('starto');
    
    const comments = await db.find()

    await comments.forEach(async (comment) => {
        console.log(await calculatePageRank(comment.linkId));
    })

    dispatch({
        type: 'AHHHH'
    })
}

export const changeScrollActive = (scrollState) => {
    return {
        type: CHANGE_SCROLL_ACTIVE,
        payload: scrollState
    }
}