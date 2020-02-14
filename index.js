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
const uri = `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;

// fs config

const fileName = config.fs.fileName
const copiedFile = `${__dirname}/${fileName}`

const mongoClient = mongodb.MongoClient
const exist = fs.existsSync(copiedFile)

if (exist) {
    fs.readFile(copiedFile, (error, data) => {
        if (error) {
            console.log(error)
            return false
        }
        const dataToJson = JSON.parse(data.toString())
        mongoClient.connect(uri, (error, client) => {
            if (error) {
                console.log(error)
                return false
            }
            const db = client.db(dbName)
            if (!db) {
                console.log(`Can not found db dbName: ${dbName}`)
            } else {
                db.collection(collectionName, (error, collection) => {
                    if (error) {
                        console.log(error)
                        return false
                    } else {
                        dataToJson.rows.map((value, index) => {
                            collection.insert(value, (error, result) => {
                                if (error) {
                                    console.log(error)
                                    console.log(`error index is ${index}`)
                                    return false
                                }
                            })
                        })
                        .then(() => console.log('paste end.'))
                    }
                })
            }
        })
    })
} else {
    console.log(`${copiedFile} does not exsist`)
}
