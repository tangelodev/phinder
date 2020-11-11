import Datastore from 'nedb-promises'

const config = Datastore.create({ filename: "config", autoload: true })

export default config

