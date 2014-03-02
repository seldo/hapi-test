exports.index = function(request,reply) {

  request.server.plugins['hapi-mysql'].pool.getConnection(function(err, connection) {

    if (err) {
      console.log(err)
      reply({
        error: "DB connection failed (0003)"
      })
      return
    }

    var sql = "select * from content order by created desc limit 1"

    // Use the connection
    connection.query(
      sql,
      // bindValues,
      function(er, rows) {

        if(er) {
          reply({
            error: "content query failed (0001)"
          })
        } else {
          if (rows.length == 0) {
            reply({
              error: "no content found (0002)"
            })
          } else {
            var result = rows[0]

            console.log(result)

            reply.view('welcome',{
              item: result
            })
          }
        }

        // And done with the connection.
        connection.release()
      }
    )
  })
}

exports.single = function(request,reply) {

}