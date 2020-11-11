import Datastore from 'nedb-promises'

const posts = Datastore.create({ filename: "posts", autoload: true })

export default posts

