var async = require('async')

exports.index = function(request,reply) {

  var getLatest = function(request,reply,cb) {
    request.server.plugins['hapi-mysql'].pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err)
        cb("DB connection failed (0003)")
        return
      }

      var sql = "select * from content order by created desc limit 1"

      // Use the connection
      connection.query(
        sql,
        // bindValues,
        function(er, rows) {

          console.log("queried stuff")

          if(er) {
            cb( "content query failed (0001)")
          } else {
            if (rows.length == 0) {
              cb("no content found (0002)")
            } else {
              var result = rows[0]
              cb(null,result)
            }
          }

          // And done with the connection.
          connection.release()
        }
      )
    })
  }

  var getIndex = function(request,reply,cb) {
    console.log("index")
    request.server.plugins['hapi-mysql'].pool.getConnection(function(err, connection) {

      if (err) {
        cb("DB connection failed (0004)")
        return
      }

      var sql = "select title, slug, published from content order by created desc limit 50"

      // Use the connection
      connection.query(
        sql,
        // bindValues,
        function(er, rows) {

          if(er) {
            cb( "content query failed (0005)")
          } else {
            if (rows.length == 0) {
              cb("no content found (0006)")
            } else {
              cb(null,rows)
            }
          }

          // And done with the connection.
          connection.release()
        }
      )
    })

  }

  async.series({
    latest: function(cb) { getLatest(request,reply,cb) },
    index: function(cb) { getIndex(request,reply,cb) }
  },function(er,results) {

    reply.view('welcome',{
      title: "Welcome!",
      item: results.latest,
      index: results.index
    })

  })
}

exports.single = function(request,reply) {

}