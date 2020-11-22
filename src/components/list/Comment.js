import React from 'react'
import {connect} from 'react-redux'
import parse from 'html-react-parser'
import './Comment.css'


class Comment extends React.Component{
    constructor(props){
        super(props)

        this.commentWrapper = null
    }

    componentDidMount() {
        this.changeHeight()
    }

    componentDidUpdate() {
        console.log("COMMENT UPDATED");
    }

    renderDate(timestamp) {
        //YIKES 🤮 ... concat the string and the vars 
        const date = new Date(timestamp * 1000)
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()
        const hour = date.getHours()
        const minute = date.getMinutes()

        return(
            <div>
                {`${day}/${month}/${year} ${hour}:${minute}`}
            </div>
        )
    }

    changeHeight = () => {
        if (this.props.isOpen) {
            this.commentWrapper.style.maxHeight = `${this.commentWrapper.scrollHeight}px`
            this.commentWrapper.style.borderBottom = "0"
        }else if(this.commentWrapper !== null){
            if (this.commentWrapper.scrollHeight < 300) {
                this.commentWrapper.style.maxHeight = `${this.commentWrapper.scrollHeight}px`
            } else {
                this.commentWrapper.style.maxHeight = "300px"
                this.commentWrapper.style.borderBottom = "1px dashed #333533"
            }               
            
        }
    }

    render(){

        return(
            <>
                <div 
                    className="item"
                    onClick={() => this.props.onClickEvent(this.changeHeight)}
                >
                    <div className="content">
                        <div className="post-title">
                            {this.props.commentData.postTitle}
                        </div>
                        <div 
                            className="comment-wrapper"
                            ref={commentWrapper => this.commentWrapper = commentWrapper}
                        >
                            {parse(this.props.commentData.bodyHTML)}  
                        </div>         
                        <div className="description">
                            {this.props.commentData.subreddit}
                            {this.renderDate(this.props.commentData.created)}
                        </div>      
                    </div>
                </div>
            </>
        )
    }
}


export default connect(null, {})(Comment)