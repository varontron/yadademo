define(
  function(require)
  {
    return withUIHelper;
    function withUIHelper() {
      var moment = require('moment');
      this.table_expenses = function() {
        return {
          order: [[1,"desc"]]
        }
      };

      this.table_sleep = function() {
        return {
          order: [[1,"desc"]]
        }
      };

      this.table_cyc = function() {
        return {
          order: [[2, "desc"]],
          columnDefs: [
          {targets:[0],
            render :function( data, type, row, meta ){
              var route = '';
               switch(data) {
                    case ('CI'):
                      route = 'Cycling Inbound';
                      break;
                    case ('CO'):
                      route = 'Cycling Outbound';
                      break;
                    case ('DI'):
                      route = 'Driving Inbound';
                      break;
                    case ('DO'):
                      route = 'Driving Outbound';
                      break;
                    }
                return route;
             }
          },
          {targets:[1],
           render :function( data, type, row, meta ){
             return Math.round(data*window.yadademo.content.constants['meters-to-miles']*10)/10;
            }
          },
          {targets:[3,4,5],
           render :function( data, type, row, meta ){
             return moment('2000-01-01 00:00:00').add(moment.duration(data*1000)).format('HH:mm:ss');
            }
          }
          ]
        }
      };
    }
  }
);
