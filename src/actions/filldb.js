import now from 'performance-now'

import pushshift from '../api/pushshift/pushshift'
import reddit from '../api/redditAPI'

import db from '../api/nedb/db'
import config from '../api/nedb/config'
import posts from '../api/nedb/posts'

import {delay, extractHTMLBodies, signPositiveZero, arrangeComments} from '../utils'
import history from '../history'

import {
    GET_SUBMISSIONS_AMOUNT,
    FETCH_SUBMISSIONS_AMOUNT_DB,
    SET_DATABASE,
    FILL_DATABASE,
    WIPE_DATABASE
} from './types'


//------------------------------------------------------------------------------------------------------------------------------
// AWAIT FETCH(null) > PASS INTO VAR >>>
// START LOOP 
//START FETCH > START LOAD OF VAR > WAIT FOR THE FETCH AND LOAD TO FINISH > PASS FETCH INTO VAR > 
//RESTART LOOP


/*

MAYBE IT'S BETTER IF INSTEAD OF COMMENTS YOU MAKE POSTS HAVE A PAGE-RANK
YOU GET THE POST ID FROM EACH COMMENT AND YOU USE THAT
THEN YOU DON'T HAVE TO MAKE ANY REQUEST FROM EXTERNAL API
NEW THING WITH POSTS IN DB
YOU FILL THE DB WITH POSTS IN SETUP
    GET ID FROM link_id
    MAKE AN ARRAY OF POSTS 
    USE SOME ALGORITHM TO CHECK IF THE POST ALREADY EXIST EVERYTIME YOU GET A NEW COMMENT -> HIGH COMPUTATION, LOW MEMORY


commentedPostsIds = [p1, p2, p3]

get postId from URL in bodyComment

check postId with commentedPostsIds
hashtable maybe?

update(posts, {pageRank++})

-----------------------------------------------------------------------------------------

You pull the posts hastable and array of outboundPosts from db
Then you run the array and one by one you check them with the hashtable
if it matches, postId++ at hashtable


*/
/*
const getOutboundLinks = (body) => {
    const regex = /www\.reddit\.com\/.*?\/.*?\/.*?\/.*?\/.*?\/([\w\d]*?)\/?\)/g
    
    const matches = [...body.matchAll(regex)]
   
    let links = matches.map((match) => {
        let [,linkId] = match
        return linkId
    }).filter((link) => link)
    
    if (links.length !== 0) {
        return links
    }
}
*/




/*

PUSHSHIFT ALLOWS ONLY ONE REQUEST PER SECOND


Starts and waits for first batch of commentsData from pushshift //ASYNC STOP

Starts getting next batch of commentsData from pushift (commentsDataAfter) //ASYNC

Uses commentsData to obtain commentsHTML from reddit's API  //ASYNC STOP

Uses commentsData and commentsHTML to arrange commentsReady (an array with the comments body and metadata necessary)

Starts and waits to insert commentsReady into the localDB //ASYNC STOP

/*

//Pagination is made using the comments' days when they were created


/*


LOOP BEGIN
    START TIMER
    START AND WAIT FETCHING BATCH
    BATCH INTO HTML
    INSERT COMMENTS
    WAIT TIMER > 1 SEC
LOOP END
*/

/*
Param: 
    An array of comments data straight from pushshift
Return: 
    An array full of comments in HTML for later parsing
Note: 
    commentData contains body and addicional data like IDs, upvotes, etc
*/
const fetchHTMLBodies = (commentsDataPushshift) => {
    // Starts getting the data from Reddit's API
    const requestsCommentsDataReddit = commentsDataPushshift.map((comment, i) => {
        const requestCommentDataReddit = reddit.get(`info.json?raw_json=1&id=${"t1_" + comment.id}`)
        return requestCommentDataReddit
    })

    return requestsCommentsDataReddit
}

// ACTION
/*
Param:
    UNIX timestamp to be able to paginate through the API using the date of the comments
    String containing the author's name
Return:
    Request's promise to Pushshift for the rawCommentsData
*/
const fetchRawCommentData = async (paginationHelper, author) => {
    return  await pushshift.get(
        // If paginationHelper is null then it takes the most recent comments written
        `comment/search/?before=${
                paginationHelper !== null 
                    ? paginationHelper
                    : ''
            }&author=${author}`
    ).catch((err) => {
        if (err.response) {
            // client received an error response (5xx, 4xx)
            console.log("Error response", err.response);
        } else if (err.request && err.request.readyState === 4) {
            console.log("Network Error", err.request);
        } else if (err.request) {
            // client never received a response, or request never left
            console.log("Error request", err.request);
        } else {
            // anything else
            console.log("Error something else", err);
        }
    })
}



/*
Param: 
    UNIX timestamp to be able to paginate through the API using the date of the comments
    String containing the author's name
Does:
    Manages loop and order of execution
*/
const executeLoop = async (author) => {
    let start = null
    let rawCommentsData = null
    let redditData = null
    let bodiesHTML = null
    let commentsReady = null
    let paginationHelper = null
    let finished = false
    let postsIds = {}

    let pushshiftTimer = null
    let redditTimer = null

    while (!finished) {
        // Starts timer for later use
        start = now()

        // TODO: Better method to fetch from pushshift. Allows to start another pushshift's request right after one second has passed
        /*
        // Fetches comments' data from Pushshift
        await pushshiftRequest

        oneSecondTimer = delay(1000).then(() => {
            pushshiftRequest = fetchRawCommentData(paginationHelper, author)
        })
        */

        // Fetches comments' data from Pushshift
        rawCommentsData = await fetchRawCommentData(paginationHelper, author)
        pushshiftTimer = now() - start
        console.log("Pushshift fetching duration: ", pushshiftTimer);

        console.log("rawCommentsData",rawCommentsData);

        // Grabs the date from the last comment in the array
        paginationHelper = rawCommentsData.data.data[rawCommentsData.data.data.length - 1].created_utc

        // Fetches the comments' bodies in HTML from Reddit's API
        redditData = await Promise.all(fetchHTMLBodies(rawCommentsData.data.data))
        // Creates new array with only HTMLbodies and Ids
        bodiesHTML = extractHTMLBodies(redditData, rawCommentsData.data.data)
        redditTimer = now () - pushshiftTimer - start
        console.log("Reddit fetching duration: ", redditTimer);

        // Filters the necessary variables
        commentsReady = arrangeComments(rawCommentsData.data.data, bodiesHTML)
        console.log("commentsReady: ", commentsReady);
        var date = new Date(commentsReady[0].created * 1000);
        console.log("timestamp: ", commentsReady[0].created);
        console.log(`date:  ${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()} `);

        commentsReady.forEach((comment,i) => {
            console.log("comment postID:   " + comment.postId + "    comment i: " + i);
        })

        commentsReady.forEach(comment => {
            if (comment.outboundPostIds) {
                console.log("outbounds", comment.outboundPostIds, "postId:" + comment.postId + " linkId: " + comment.linkId);

                comment.outboundPostIds.forEach(outboundPostId => {
                    if (!postsIds.hasOwnProperty(outboundPostId)){
                        postsIds[outboundPostId] = -1
                    }else {
                        postsIds[outboundPostId] += signPositiveZero(postsIds[outboundPostId])
                    }
                })
            }
            
            if (!postsIds.hasOwnProperty(comment.postId)) {
                postsIds[comment.postId] = 0 
            }else {
                postsIds[comment.postId] = Math.abs(postsIds[comment.postId])
            }
        })

        const test = {}
        for(var k in postsIds) test[k]=postsIds[k];

        console.log("postsIds", test);
        console.log("postsIds length", Object.keys(test).length);

        // Inserts into db
        await db.insert(commentsReady)     

        
        // Waits until 1 second passes from the previous request
        console.log("Total cycle Time: ", now() - start);
        if (now() - start < 1000) {
            let delayTime = 1000 - (now() - start)
            console.log("Waited for ", delayTime);
            await delay(delayTime)
        }

        // Checks if its the last cycle by watching the comment's array length
        if (rawCommentsData.data.data.length < 25) {
            finished = true
        }
        
        console.log("-----------------------------")
    }

    /*
    const postStart = now()

    console.log("postIds", postsIds);

    let unduplicatePostIds = []

    unduplicatePostIds.push(...removeDuplicates(postsIds))

    console.log("unduplicatePostIds", unduplicatePostIds);

    console.log("post timer: ", now() - postStart );
    */

    await posts.insert(postsIds)

    console.log("postsIds", postsIds);
}


/*
Param: 
    UNIX timestamp to be able to paginate through the API using the date of the comments
    String containing the author's name
Does:
    Setups stuff for the massive insert
*/
export const loadAll = (author) => async (dispatch) => {
    // Makes sure that it's registered in the db that the Great Insert hasn't been done
    // TO DO: Be more specific, put it in settings or something 
    config.update({databasefull: false})

    // Cleans database of any trash data
    console.log('Before Wipe: ' , await db.find());
    await dispatch(wipeDatabase())
    console.log('After Wipe: ' , await db.find());

    await executeLoop(author)

    // Registers in the database that the Great Insert has been completed
    await dispatch(fillDatabase())

    // Returns to main page after the process is finished
    history.push('/')
} 


export const getSubmissionsAmount = (author) => async (dispatch) => {        
   const {data: {aggs: {author: [ {doc_count: submissionCount }]}}} = await pushshift.get(`submission/search/?author=${author}&aggs=author&limit=0`)
   const {data: {aggs: {author: [ {doc_count: commentCount }]}}} = await pushshift.get(`comment/search/?author=${author}&aggs=author&limit=0`)
   const totalSubmissions = submissionCount + commentCount
    
   dispatch({
       type: GET_SUBMISSIONS_AMOUNT,
       payload: totalSubmissions
   })
}

export const fetchSubmissionsAmountDb = () => async (dispatch) => {
    const totalAmount = await db.count()
    
    dispatch({
        type: FETCH_SUBMISSIONS_AMOUNT_DB,
        payload: totalAmount
    })
}

export const setDatabase = () => async (dispatch) => {
    await db.ensureIndex({fieldName: 'linkId', unique: true})

    dispatch({
        type: SET_DATABASE,
        payload: true
    })
}

export const fillDatabase = () => async (dispatch) => {
    config.update({databasefull: true})
    
    dispatch({
        type: FILL_DATABASE,
        payload: true
    })
}

export const wipeDatabase = () => async (dispatch) => {
    await db.remove({body: {$exists: true}}, { multi: true }).catch((e) => {
        console.log(e)        
    })

    await posts.remove({}, { multi: true }).catch((e) => {
        console.log(e)        
    })

    dispatch({
        type: WIPE_DATABASE
    })
}