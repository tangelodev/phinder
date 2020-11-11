import React from 'react'
import now from 'performance-now'

import './ProgressBar.css'
import Filler from './Filler'

import {fetchRawCommentData} from '../../api/pushshift/index'
import reddit from '../../api/redditAPI'

import db from '../../api/nedb/db'
import config from '../../api/nedb/config'
import posts from '../../api/nedb/posts'

import {delay, extractHTMLBodies, arrangeComments, hash, destructurizeRedditResponse, arrJoin, getFormattingPoints} from '../../utils'
import history from '../../history'


class ProgressBar extends React.Component{

    /*
    Param: 
        An array of comments data straight from pushshift
    Return: 
        An array full of comments in HTML for later parsing
    Note: 
        commentData contains body and addicional data like IDs, upvotes, etc
    */
    fetchHTMLBodies = (commentsDataPushshift) => {
        // Starts getting the data from Reddit's API
        const requestsCommentsDataReddit = commentsDataPushshift.map((comment, i) => {
            const requestCommentDataReddit = reddit.get(`info.json?raw_json=1&id=${"t1_" + comment.id}`)
            return requestCommentDataReddit
        })

        return requestsCommentsDataReddit
    }




    /*
    Param: 
        UNIX timestamp to be able to paginate through the API using the date of the comments
        String containing the author's name
    Does:
        Manages loop and order of execution
    */
    executeLoop = async (author) => {
        let start = null
        let bodiesHTML = null
        let commentsReady = null
        let paginationHelper = null
        let finished = false

        let pushshiftTimer = null
        let redditTimer = null

        while (!finished) {
            // Starts timer for later use
            start = now()

            // Fetches comments' data from Pushshift
            const rawCommentsData = await fetchRawCommentData(paginationHelper, author)
            pushshiftTimer = now() - start
            console.log("Pushshift fetching duration: ", pushshiftTimer);

            console.log("rawCommentsData",rawCommentsData);

            // Grabs the date from the last comment in the array
            paginationHelper = rawCommentsData.data.data[rawCommentsData.data.data.length - 1].created_utc

            // Fetches the comments' bodies in HTML from Reddit's API
            const redditData = await Promise.all(this.fetchHTMLBodies(rawCommentsData.data.data))


            console.log("destructurizeRedditResponse", destructurizeRedditResponse(redditData));
            console.log("redditData",redditData);

            const x = rawCommentsData.data.data
            const y = destructurizeRedditResponse(redditData)

            console.log(arrJoin(x, y, "id", "body_html", (x, y) => {
                return {
                    body: x.body,
                    created: x.created_utc,
                    subreddit: x.subreddit,
                    author: x.author,
                    // https://www.reddit.com/${postId} => returns posts URL
                    postId: x.link_id.split('t3_')[1],   
                    // https://www.reddit.com/r/askphilosophy/comments/ghysp9/evidence_for_free_will/${parentId} => returns parents comment URL or postId if it's first comment in chain
                    parentId: x.parent_id, 

                    // returns own comment URL
                    linkId: x.id,          
                    //outboundLinks: getOutboundLinks(comment.body),
                    //pageRank: 1,
                    bodyHTML: y.body_html,
                    formattingPoints: getFormattingPoints(y.body_html),
                    lengthPoints: y.body_html.length      
                }
            }));

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
    }


    /*
    Param: 
        UNIX timestamp to be able to paginate through the API using the date of the comments
        String containing the author's name
    Does:
        Setups stuff for the massive insert
    */
    loadAll = async (author) => {
        // Makes sure that it's registered in the db that the Great Insert hasn't been done
        // TO DO: Be more specific, put it in settings or something 
        config.update({databasefull: false})

        // Cleans database of any trash data
        console.log('Before Wipe: ' , await db.find());
        await this.wipeDatabase()
        console.log('After Wipe: ' , await db.find());

        await this.executeLoop(author)

        // Registers in the database that the Great Insert has been completed
        //await dispatch(fillDatabase())

        // Returns to main page after the process is finished
        history.push('/')
    } 

    
    wipeDatabase = async () => {
        await db.remove({body: {$exists: true}}, { multi: true }).catch((e) => {
            console.log(e)        
        })

        await posts.remove({}, { multi: true }).catch((e) => {
            console.log(e)        
        })
    }

    componentDidMount(){
        console.log("IM RENDERED");
        this.loadAll(this.props.author)
    }

    render(){
        return(
            <div className={`loading visible`}>
            <p className="message">Please wait while the database loads</p>
            <div className="loading-bar">
            <div className="progress-bar">
                <Filler />
            </div>
            </div>                    
            </div>
 
        )
    }
}

export default ProgressBar