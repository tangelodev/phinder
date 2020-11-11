import pushshift from './pushshift'

export const fetchRawCommentData = async (paginationHelper, author) => {
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