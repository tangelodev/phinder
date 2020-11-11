export const asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

export const delay = function(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}

// UTILS
/*
Param:
    Array with elements that are duplicates
Return:
    Array containing objects containing postIds
*/
export const signPositiveZero = (x) => {
    return ( ( (x >= 0) ? 1 : 0 ) - (x < 0)) || +x;
}

// UTILS
/*
Param: 
    An array of comments data straight from pushshift
Return: 
    An array full of comments in HTML for later parsing
Note: 
    commentData contains body and addicional data like IDs, upvotes, etc
*/
export const getOutboundPostIds = (HTMLbody) => {
  const regex = /https:\/\/www\.reddit\.com\/r\/.*?\/comments\/(.*?)\//g

  const matches = [...HTMLbody.matchAll(regex)]

  let postIds = matches.map((match) => {
      let [,linkId] = match
      return linkId
  }).filter( (link, i, a) => {
      // removes duplicates
      return a.indexOf(link) === i
  })

  if (postIds.length !== 0) {
      return postIds
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
export const extractHTMLBodies = (commentsDataReddit, commentsDataPushshift) => {

  // Destructurizes the data received from Reddit's API (id and HTML)
  const bodiesHTML = commentsDataReddit.map((commentData, i) => {

      // Check if it couldn't retrieve any comment's data from Reddit's API (Because the subreddit is private or something else)
      if (commentData.data.data.children[0] === undefined) {
          console.log("HIDDEN HTML 🐔");
          return {
              id: commentsDataPushshift[i].id,
              hidden: true,
              html: 'No HTML found'
          }
      }
      
      try {
          return {
              id: commentData.data.data.children[0].data.id,
              html: commentData.data.data.children[0].data.body_html,
              permalink: commentData.data.data.children[0].data.permalink
          }
      } catch (error) {
          return console.log({
              message: 'Error at destructurizing of HTML bodies',
              error,
              commentsDataPushshift,
              commentsDataReddit,
              commentData,
              index: i
          });
      }

  })

  // Returns an array full of comments in HTML 
  return bodiesHTML
}

  
// UTILS
/*
Param: 
    Regex with desired search object
    Text to search
    Point value
Return: 
    An integer describing how many point does the text have
*/
export const getPoints = (regex, text, multiplier) => {
    const matches = [...text.matchAll(regex)]
    return matches.length * multiplier
}


// UTILS
/*
Param: 
    An array of comments data straight from pushshift
Return: 
    An array full of comments in HTML for later parsing
Note: 
    commentData contains body and addicional data like IDs, upvotes, etc
*/
export const getFormattingPoints = (HTMLbody) => {
    let formattingPoints = 0

    formattingPoints += getPoints(/<h1>/g, HTMLbody, 30)
    formattingPoints += getPoints(/<h2>/g, HTMLbody, 30)
    formattingPoints += getPoints(/<h3>/g, HTMLbody, 30)
    formattingPoints += getPoints(/<h4>/g, HTMLbody, 30)
    formattingPoints += getPoints(/<table>/g, HTMLbody, 15)
    formattingPoints += getPoints(/<ul>/g, HTMLbody, 5)
    formattingPoints += getPoints(/<em>/g, HTMLbody, 2)
    formattingPoints += getPoints(/<strong>/g, HTMLbody, 2)
    formattingPoints += getPoints(/<sup>/g, HTMLbody, 2)
    formattingPoints += getPoints(/<blockquote>/g, HTMLbody, 1)
   
    return formattingPoints
}

// UTILS
/*
Param: 
    An array of comments data straight from pushshift
    An array full of comments in HTML
Return:
    An array with the comment's data required for insertion
*/
export const arrangeComments = (commentsDataPushshift, bodiesHTML) => {

    const commentsReady = commentsDataPushshift.map((commentData, i) => {


        // Returns object with the structure of what is going to be saved later
        return {
            body: commentData.body,
            created: commentData.created_utc,
            subreddit: commentData.subreddit,
            author: commentData.author,

            // https://www.reddit.com/${postId} => returns posts URL
            postId: commentData.link_id.split('t3_')[1],   

            // https://www.reddit.com/r/askphilosophy/comments/ghysp9/evidence_for_free_will/${parentId} => returns parents comment URL or postId if it's first comment in chain
            parentId: commentData.parent_id, 

            // returns own comment URL
            linkId: commentData.id,          
            //outboundLinks: getOutboundLinks(comment.body),
            //pageRank: 1,
            bodyHTML: 
                commentData.id === bodiesHTML[i].id 
                ? bodiesHTML[i].html
                // WTF IS THIS FOR
                : console.log(`ERROR: commentData index doesn't match bodiesHTML at arrangeComments function, index: ${bodiesHTML[i].id}`),
            formattingPoints: getFormattingPoints(bodiesHTML[i].html),
            lengthPoints: bodiesHTML[i].html.length,
            outboundPostIds: getOutboundPostIds(bodiesHTML[i].html)
        }
    })

    return commentsReady
}

export const hash = (table, key) => {
    var hashTable = {}

    for (var i = 0; i < table.length; i++) { 
        hashTable[table[i][key]] = table[i]
    }

    return hashTable
};

export const destructurizeRedditResponse = (arr) => {
    return arr.map(e => {
        return e.data.data.children[0].data
    })
};

export const  join = (mainTable, lookupTable, selectValue) => {

    for (let key in mainTable) {
        if( lookupTable.hasOwnProperty(key) ){
            mainTable[key][selectValue] = lookupTable[key][selectValue]
        }
    }

    return mainTable
};

export const  arrJoin = (mainTable, lookupTable, lookupKey, selectValue, select) => {
    return mainTable.map((e, i) => {
        if (e[lookupKey] === lookupTable[i][lookupKey]) 
            //return {...e, [selectValue]: lookupTable[i][selectValue]}
            return select(e, lookupTable[i])
    })
};
