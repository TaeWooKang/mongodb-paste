const mongodb = require('mongodb')
const fs = require('fs')
const config = require('./config.json')

// db config

const username = config.mongo.username
const password = config.mongo.password
const host = config.mongo.host
const port = config.mongo.port
const dbName = config.mongo.dbName
const collectionName = config.mongo.collectionName
const uri = username && password ?
`mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`
: `mongodb://${host}:${port}/${dbName}`

// fs config

const fileName = config.fs.fileName
const copiedFile = `${__dirname}/${fileName}`

const mongoClient = mongodb.MongoClient
const exist = fs.existsSync(copiedFile)

if (!username || !password) {
  console.log('no authentication process. (empty username or password )')
}
// file exist check
if (exist) {
  //file read
  fs.readFile(copiedFile, (error, data) => {
    if (error) {
      return false
    }
    // data parsing
    const dataToJson = JSON.parse(data.toString())
    //data converting
    const convertedData = dataToJson.rows.map((document, index) => {
      return {
        _id: mongodb.ObjectId(document._id),
        name: document.name,
        }
      })
      //db client connect
    mongoClient.connect(uri, (error, client) => {
      if (error) {
        console.log(error)
        return false
      }

      //get target db
      const db = client.db(dbName)
      if (!db) {
        console.log(`Can not found db dbName: ${dbName}`)
      } else {
        // get target collection
        db.collection(collectionName, (error, collection) => {
          if (error) {
            console.log(error)
            return false
          } else {
            // insert converted data to collection
            collection.insertMany(convertedData)
            .then(() => console.log('done, press on "ctrl + c"'))
            .catch((error) => {throw error})
          }
        })
      }
    })
  })
} else {
    console.log(`${copiedFile} does not exsist`)
}
