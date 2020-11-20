import React from 'react'
import { connect } from 'react-redux'
import './List.css'

import DropdownMenu from '../common/DropdownMenu'

import Comment from './Comment'

import { fetchComments, changeScrollActive, addCommentsToList, cleanCommentsList, setSortingBy, setFindingByString} from '../../actions/listdb'

// Create ListingScreen component and List component separately. When List is render then scrollActive = true

class List extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            activeCommentIndex: null,
            sortingMenuVisibility: false
        }

        this.lastComment = React.createRef()

        this.commentWrappers = []
       
        this.observer = new IntersectionObserver(this.doNext,{
            threshold: 1
        });

        this.findingByStringBefore = null
        this.sortingByBefore = null
    }

    componentDidMount() {
        this.props.cleanCommentsList()

        //this.props.setSortingBy("relevance")
        
        //this.props.addCommentsToList(this.props.findingByString, this.props.sortingBy, null)

        this.observer.observe(this.lastComment.current)        
    }

    componentDidUpdate() {        
        console.log("LIST UPDATED");
       
        if (this.findingByStringBefore !== this.props.findingByString) {
            this.findingByStringBefore = this.props.findingByString
            this.props.changeScrollActive(false)
            this.props.cleanCommentsList()
            this.props.addCommentsToList(this.props.findingByString, this.props.sortingBy, null)         
        }    

        if (this.sortingByBefore !== this.props.sortingBy) {
            this.sortingByBefore = this.props.sortingBy
            this.props.changeScrollActive(false)
            this.props.cleanCommentsList()
            this.props.addCommentsToList(this.props.findingByString, this.props.sortingBy, null)         
        }  
    }


    clickEvent = (i, callback) => {
        this.setState({
            activeCommentIndex: this.state.activeCommentIndex===null || this.state.activeCommentIndex!==i ? i : null
        }, callback)
    }

    renderList(){
        if (!this.props.comments) {
            return
        }
        
        return this.props.comments.map((comment, i) => {
            return (
                <Comment 
                    commentData={comment} 
                    isOpen={this.state.activeCommentIndex === i ? true : false }
                    onClickEvent={(callback) => this.clickEvent(i, callback)}
                    key={comment._id}
                />
            )
        })
    }

    
    doNext = (entries) => {        
        const first = entries[0]
        if (!this.props.scrollActive || !first.isIntersecting) return
        this.props.changeScrollActive(false)
        console.log('🐥');
        this.props.addCommentsToList(this.props.findingByString, this.props.sortingBy,this.props.comments[this.props.comments.length-1])
    }

    doPageRank = () => {
        this.props.fetchComments()
    }

    
    render() {

        const sortingOptions =
            <>
                <div onClick={() => this.props.setSortingBy("date")}>Date</div>
                <div onClick={() => this.props.setSortingBy("relevance")}>Relevance</div>
            </>

        return (
            <>
                <div className="list">
                    <DropdownMenu content={sortingOptions} />
                    {this.renderList()}
                </div>
                <div className="next" ref={this.lastComment} >
                    next
                </div>
                <div onClick={this.doPageRank}>
                    Press me
                </div>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        comments: state.listing.comments,
        scrollActive: state.listing.scrollActive,
        sortingBy: state.listing.sortingBy,
        findingByString: state.listing.findingByString
    }
}

export default connect(mapStateToProps, { fetchComments, changeScrollActive, addCommentsToList, cleanCommentsList, setSortingBy, setFindingByString })(List)

