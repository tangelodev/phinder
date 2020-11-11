import axios from 'axios'

import {delay} from '../../utils'

const pushshiftURL = "https://api.pushshift.io/reddit/"

const pushshift = axios.create({
    baseURL: pushshiftURL
})

pushshift.interceptors.response.use(null, async err => {
        
    // Check if there is some network error and then try the request again if there is
    if (err.request && err.request.readyState === 4) {
        console.log("Retrying connection...")
        await delay(1000)
        return pushshift.request({
            url: err.config.url
        })
    }

    return Promise.reject(err);
}
);

export default pushshift