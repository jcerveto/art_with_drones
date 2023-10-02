const mongoose = require('mongoose');

/**
 * https://www.mongodb.com/docs/drivers/node/v4.1/quick-start/
 */
//   "mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env}`

mongoose.connect(uri)