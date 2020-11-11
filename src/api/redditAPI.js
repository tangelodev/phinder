import axios from 'axios'

import {delay} from '../utils'

const redditURL = "https://www.reddit.com/api/"

const reddit = axios.create({
    baseURL: redditURL
})

reddit.interceptors.response.use(null, async err => {
        
    // Check if there is some network error and then try the request again if there is
    if (err.request && err.request.readyState === 4) {
        console.log("Retrying connection...")
        await delay(1000)
        return reddit.request({
            url: err.config.url
        })
    }

    return Promise.reject(err);
}
);

export default reddit