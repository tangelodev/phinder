import React from 'react'
import now from 'performance-now'

import './ProgressBar.css'
import Filler from './Filler'

import {fetchRawCommentData, getSubmissionsAmount} from '../../api/pushshift/index'
import reddit from '../../api/redditAPI'

import db from '../../api/nedb/db'
import config from '../../api/nedb/config'
import posts from '../../api/nedb/posts'

import {delay, destructurizeRedditResponse, arrJoin, getFormattingPoints} from '../../utils'
import history from '../../history'


class ProgressBar extends React.Component{
    constructor(){
        super()
        this.state = {
            submissionsAmount: null,
            submissionsLoaded: 0
        }
    }

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

        let paginationHelper = null
        let finished = false

        while (!finished) {
            // Starts timer for later use
            const start = now()

            console.log("paginationHelper", paginationHelper);

            // Fetches comments' data from Pushshift
            const {data: {data: rawCommentsData}} = await fetchRawCommentData(paginationHelper, author)
            const pushshiftTimer = now() - start
            console.log("Pushshift fetching duration: ", pushshiftTimer);

            console.log("rawCommentsData",rawCommentsData);

            // Grabs the date from the last comment in the array
            paginationHelper = rawCommentsData[rawCommentsData.length - 1].created_utc

            // Fetches the comments' bodies in HTML from Reddit's API
            const redditData = await Promise.all(this.fetchHTMLBodies(rawCommentsData))
            const redditTimer = now () - pushshiftTimer - start
            console.log("Reddit fetching duration: ", redditTimer);

            console.log("destructurizeRedditResponse", destructurizeRedditResponse(redditData));
            console.log("redditData",redditData);

            const x = rawCommentsData
            const y = destructurizeRedditResponse(redditData)

            const commentsReady = arrJoin(x, y, "id", (x, y) => {
                return {
                    body: x.body,
                    created: x.created_utc,
                    subreddit: x.subreddit,
                    author: x.author,
                    postId: x.link_id.split('t3_')[1],    // https://www.reddit.com/${postId} => returns posts URL       
                    parentId: x.parent_id,    // www.reddit.com/r/.../comments/ghysp9/.../${parentId} => returns parents comment URL or postId if it's first comment in chain
                    linkId: x.id,    // returns own comment URL
                    isThereBodyHTML: y.body_html ? true : false,
                    bodyHTML: y.body_html ? y.body_html : x.body,
                    formattingPoints: getFormattingPoints(y.body_html),
                    lengthPoints: y.body_html.length      
                }
            })

            console.log("commentsReady: ", commentsReady);

            // Inserts into db
            await db.insert(commentsReady)     

            // Updates for loader
            this.setState({submissionsLoaded: this.state.submissionsLoaded + commentsReady.length})
            
            // Waits until 1 second passes from the previous request
            console.log("Total cycle Time: ", now() - start);
            if (now() - start < 1000) {
                let delayTime = 1000 - (now() - start)
                console.log("Waited for ", delayTime);
                await delay(delayTime)
            }

            // Checks if its the last cycle by watching the comment's array length
            if (rawCommentsData.length < 25) {
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

        // Makes linkId unique
        await db.ensureIndex({fieldName: 'linkId', unique: true})

        // Cleans database of any trash data
        console.log('Before Wipe: ' , await db.find());
        await this.wipeDatabase()
        console.log('After Wipe: ' , await db.find());

        await this.executeLoop(author)

        // Registers in the database that the Great Insert has been completed
        await config.update({databasefull: true})

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

    calculatePercentage(){
        if (!this.state.submissionsAmount) {
            return 0
        }
        const percentage = ( this.state.submissionsLoaded / this.state.submissionsAmount ) * 100
        
        if (percentage === 100) {
            history.push('/')
        } else {
            return percentage
        }

    }

    componentDidMount(){
        console.log("IM RENDERED", this.props.author);
        this.loadAll(this.props.author)
        this.setState({submissionsAmount: getSubmissionsAmount(this.props.author)})
    }

    render(){
        return(
            <div className={`loading visible`}>
            <p className="message">Please wait while the database loads</p>
            <div className="loading-bar">
            <div className="progress-bar">
                <Filler percentage={this.calculatePercentage()} />
            </div>
            </div>                    
            </div>
 
        )
    }
}

export default ProgressBar