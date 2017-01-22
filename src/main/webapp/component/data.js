define(
  [
     'component/base'
  ],
  function(base)
  {
    'use strict';
    return base.mixin(Data);
    function Data() {

      this.getData = function() {
        var that = this;
        var data = window.yadademo.content.data;
        let i=0;
        while(data[i])
        {
          var dataConf = data[i++];
          var a    = null;

          var aResolve = function(r) {
            // get qname from response
            var qname = !!r.qname ? typeof r.qname == "string" ? r.qname : r.qname.join(",") : r.RESULTSET.qname;
            var dataObj, q, j = 0;
            while(data[j] // still iterating over panels
                  && (!!!q           // before first iter
                  ||  q != qname))    // "q" set in iter to current qname from response

            {
              dataObj = data[j++];

              // kill the loop
              q  = dataObj.q
                    || dataObj.ajax.q
                    || _.map(JSON.parse(dataObj.ajax.j.replace(/'/g,"\"")),function(o) { return o.qname; }).join(',')
            }
            dataObj.loaded = true;
            if(!!r.RESULTSET && !!r.RESULTSET.ROWS)
            {

              if(q == 'BLSCDB all rows')
              {
                dataObj.data = _.map(JSON.parse(r.RESULTSET.ROWS[0]).rows,function(o) {
                  return o.value;
                });
              }
              else
              {
                dataObj.data = r.RESULTSET.ROWS;
              }
            }
            else
            {
                dataObj.data = r;
            }
          };
          var aReject = function(e) {
            alert("Problem with detail data query:" + e);
          };

          if(!!dataConf.q)
          {
            a = this.executeYADAQuery(dataConf.q,dataConf.p)
          }
          else if(!!dataConf.ajax)
          {
            a = $.ajax({
              data:dataConf.ajax
            });
          }
          $.when(a).then(aResolve,aReject);
        }
      };


      this.after('initialize', function() {
        this.getData();
      });
    }
  }
);
