var async = require('async')

var getItem = function(request,slug,cb) {

  console.log("slug is " + slug)

  request.server.plugins['hapi-mysql'].pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      cb("DB connection failed (0003)")
      return
    }

    // what we want is this item, and the item the comes immediately after it chronologically
    var sql = "select * from content " +
      "where published <= " +
      "(select published from content " +
      "where slug = ? ) " +
      "order by published desc limit 2";

    console.log(sql)
    console.log(slug)

    // Use the connection
    connection.query(
      sql,
      [slug],
      function(er, rows) {

        console.log("queried stuff")

        if(er) {
          cb( "content query failed (0001)")
        } else {
          if (rows.length == 0) {
            cb("no content found (0002)")
          } else {
            var result = rows[0]
            result.nextSlug = rows[1].slug
            cb(null,result)
          }
        }

        // And done with the connection.
        connection.release()
      }
    )
  })


}

/*
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
*/

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


exports.index = function(request,reply) {

  getIndex(request,reply,function(er,index) {

    var firstItem = index[0].slug
    getItem(request,firstItem,function(er,latest) {

      if (er) throw new Error(er)

      reply.view('welcome',{
        title: "Welcome!",
        entry: latest,
        index: index
      })

    })

  })
}

exports.single = function(request,reply) {

  getItem(request,request.params.slug,function(er,item) {

    if (er) throw new Error(er)

    reply.view('single',{
      item: item
    })

  })

}