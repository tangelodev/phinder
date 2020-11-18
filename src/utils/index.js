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


export const destructurizeRedditResponse = (arr) => {
    return arr.map(e => {
        try {
            return e.data.data.children[0].data
        }
        catch (err) {
            console.log("err", err);
            console.log("e", e);
            return {
                id: null,
                body_html: null
            }
        }
    })
};

export const  arrJoin = (mainTable, lookupTable, lookupKey, select) => {
    return mainTable.map((e, i) => {
        if (e[lookupKey] === lookupTable[i][lookupKey]) 
            return select(e, lookupTable[i])
        else return select(e, null)
    })
};
