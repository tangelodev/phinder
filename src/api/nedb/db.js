import Datastore from 'nedb-promises'

const db = Datastore.create({ filename: "comments", autoload: true })

export default db




