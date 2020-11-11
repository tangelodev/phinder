import React from 'react'
import { connect } from 'react-redux'
import { Form, Field } from 'react-final-form'

import './SearchBar.css'

import {ReactComponent as MagnifyingGlass} from '../../resources/magnifying glass.svg'
import {ReactComponent as Arrow} from '../../resources/arrow3.svg'
import { setFindingByString, cleanCommentsList } from '../../actions/listdb'

class SearchBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showAdvanceOptions: false
        }
    }

    showAdvanceOptions = (event) => {
        event.preventDefault();
        
        this.setState({ showAdvanceOptions: true }, () => {
            document.addEventListener('click', this.closeAdvanceOptions);
        });
      }
      
    closeAdvanceOptions = (event) => {
        
        if (!this.advancedOptions.contains(event.target) && !this.searchInput.contains(event.target) ) {
            
            this.setState({ showAdvanceOptions: false }, () => {
                document.removeEventListener('click', this.closeAdvanceOptions);
            });  
            
        }
    }

    onSubmit = values => {
        this.props.setFindingByString(values.search)

        alert(JSON.stringify(values))
    }


    render() {
        let arrowClass = "arrow-icon" + (this.state.showAdvanceOptions ? " down" : "")

        return (
            <>
            <Form onSubmit={this.onSubmit}>
                {({ handleSubmit}) => (
                    
                    <form onSubmit={handleSubmit}>
                        
                        <div className="ui search-bar">
                            <div className="arrow-icon-wrapper" onClick={this.showAdvanceOptions}>
                                <Arrow className={arrowClass} />
                            </div>                            

                            <Field name="search" placeholder="Search" type="text" >
                                {({input, meta, placeholder}) => (    
                                    <div className="search-input-text-wrapper" >
                                        <input 
                                            {...input} 
                                            className="search-input-text" 
                                            placeholder={placeholder} 
                                            autoComplete="off" 
                                            spellCheck="false" 
                                            autoCorrect="off" 
                                            ref={(element) => {
                                                this.searchInput = element
                                            } } 
                                        />
                                    </div>                          
                                )}
                            </Field>

                            <MagnifyingGlass className="magnifying-glass-icon" onClick={handleSubmit} type="submit" />
                        </div>

                        <div 
                            className={`ui expanded-search ${this.state.showAdvanceOptions ? 'expanded' : 'not-expanded'}`} 
                            ref={(element) => {
                                this.advancedOptions = element
                            } } 
                        >
                            <div className="grid-cell">

                                <Field name="from" type="date">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">From</label>
                                            <input {...input} className="date-input" min="2005-06-23" value="2005-06-23" />
                                        </div>                          
                                    )}
                                </Field>

                                <Field name="to" type="date">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">To</label>
                                            <input {...input} className="date-input" min="2005-06-23" />
                                        </div>                          
                                    )}
                                </Field>

                                <Field name="hidden" type="checkbox">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">Hidden</label>
                                            <input {...input} />
                                        </div>                          
                                    )}
                                </Field>

                                <Field name="threadId" type="text">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">Thread ID</label>
                                            <input {...input} className="number-input" />
                                        </div>                          
                                    )}
                                </Field>
                                
                            </div>

                            <div className="grid-cell">

                                <Field name="pagerankCriteria" type="text">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">Subreddit</label>
                                            <input {...input} className="text-input" />
                                        </div>                          
                                    )}
                                </Field>
                            
                                <Field name="pagerankCriteria" type="range">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">PageRank</label>
                                            <input {...input} className="input-slider" />
                                        </div>                          
                                    )}
                                </Field>

                                <Field name="formattingCriteria" type="range">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">Formatting</label>
                                            <input {...input} className="input-slider" />
                                        </div>                          
                                    )}
                                </Field>

                                <Field name="lengthCriteria" type="range">
                                    {({input, meta}) => (    
                                        <div className="grid-element">
                                            <label className="input-label">Length</label>
                                            <input {...input} className="input-slider" />
                                        </div>                          
                                    )}
                                </Field>

                            </div>                             

                        </div>
                    </form>                
                )
                }
            </Form>

            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {}
}

export default connect(mapStateToProps, {setFindingByString, cleanCommentsList})(SearchBar)