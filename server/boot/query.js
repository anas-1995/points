'use strict';

const fields = {

}

const relationName = {
}

module.exports = {
  multiTowLevel: function (app, arrayOfTable, arrayRelation, filter, isCount = false) {
    return new Promise(function (resolve, reject) {
      var sql = require('sql-query');
      var sqlQuery = sql.Query();
      var sqlSelect = sqlQuery.select();
      var arraywhereObject = []
      var limit = 10;
      var skip = 0;
      var orderKey = "id";
      var orderType = "Z"

      console.log(filter.where.and)
      if (filter.where && filter.where.and) {
        for (let index = 0; index < arrayOfTable.length; index++) {
          const element = arrayOfTable[index];
          arraywhereObject[index] = []
        }
        for (let index = 0; index < filter.where.and.length; index++) {
          const element = filter.where.and[index];
          console.log("element")
          console.log(element)

          for (var key in element) {
            console.log("key")
            console.log(key)
            var object = {}
            if (element.hasOwnProperty(key)) {
              var n = key.lastIndexOf('.');
              var mainKey = key.substring(n + 1);
              var value = element[key]
              console.log("mainKey")
              console.log(mainKey)
              if (typeof value !== 'object') {
                object = {
                  "key": mainKey,
                  "value": value
                }
              } else {
                if (value['like'] != null) {
                  object = {
                    "key": mainKey,
                    "value": sql.like("%" + value['like'] + "%")
                  }
                } else if (value['gte'] != null) {
                  object = {
                    "key": mainKey,
                    "value": sql.gte(value['gte'])
                  }
                } else if (value['gt'] != null) {
                  object = {
                    "key": mainKey,
                    "value": sql.gt(value['gt'])
                  }
                } else if (value['lte'] != null) {
                  object = {
                    "key": mainKey,
                    "value": sql.lte(value['lte'])
                  }
                } else if (value['lt'] != null) {
                  object = {
                    "key": mainKey,
                    "value": sql.lt(value['lt'])
                  }
                }
              }
              if (n == -1) {
                arraywhereObject[0].push({
                  [object['key']]: object['value']
                })
              } else {
                for (let index = 1; index < arrayOfTable.length; index++) {
                  const element = arrayOfTable[index];
                  if (key.lastIndexOf(element + '.') != -1) {
                    arraywhereObject[index].push({
                      [object['key']]: object['value']
                    })
                  }
                }
              }
            }
          }

        }
      }
      if (isCount == false) {
        if (filter.limit) {
          limit = filter.limit
        }
        if (filter.skip) {
          skip = filter.skip
        }
        if (filter.order) {
          var m = filter.order.lastIndexOf(' ');
          orderKey = filter.order.substring(0, m);
          if (filter.order.lastIndexOf('ASC') != -1) {
            orderType = "a"
          }
        }
      }
      var query = sqlSelect
        .from(arrayOfTable[0])
        .select(fields[arrayOfTable[0]])
      for (let index = 0; index < arraywhereObject[0].length; index++) {
        const whereElement = arraywhereObject[0][index];
        query = query
          .where(arrayOfTable[0], whereElement)
      }
      for (let index = 0; index < arrayRelation.length; index++) {
        const element = arrayRelation[index];
        query = query
          .from(arrayOfTable[element.fromTable], element['fromId'], arrayOfTable[element.mainTable], element['mainId'])
        // .where( arraywhereObject[element.fromTable])
        for (let whereIndex = 0; whereIndex < arraywhereObject[element.fromTable].length; whereIndex++) {
          const whereElement = arraywhereObject[element.fromTable][whereIndex];
          query = query
            .where(arrayOfTable[element.fromTable], whereElement)
        }

      }
      if (isCount == false) {
        query = query
          .order(orderKey, orderType)
          .limit(skip + "," + limit)
          .build()
      }
      else {
        query = query
          .count(null, 'count')
          .build()
      }
      var selectIndex = query.indexOf('SELECT') + 6
      for (let index = 0; index < arrayRelation.length; index++) {
        const relationelement = arrayRelation[index];
        var addedString = " JSON_OBJECT(";
        fields[arrayOfTable[relationelement.fromTable]].forEach(element => {
          addedString += '"' + element + '",' + 't' + (relationelement.fromTable + 1) + '.' + element + ','
        });
        addedString = addedString.substring(0, addedString.length - 1);
        addedString += ') AS ' + relationName[arrayOfTable[relationelement.fromTable]] + ' , '
        query = query.slice(0, selectIndex) + addedString + query.slice(selectIndex);
      }
      console.log(query);
      const connector = app.dataSources.mainDB.connector;
      connector.execute(query, null, (err, resultObjects) => {
        if (!err) {
          if (isCount)
            resolve({ "count": resultObjects[0]["count"] })
          else {
            for (let index = 0; index < resultObjects.length; index++) {
              const element = resultObjects[index];
              arrayRelation.forEach(relationElement => {
                resultObjects[index][relationName[arrayOfTable[relationElement.fromTable]]] = JSON.parse(element[relationName[arrayOfTable[relationElement.fromTable]]])
              });
            }
          }
          resolve(resultObjects)
        } else
          reject(err)
      })

      // })
    })
  }
}
