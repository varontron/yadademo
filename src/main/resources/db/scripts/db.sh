#/bin/bash

#call with: sqlite3 dbname.db < `db.sh tablename filename`

CREATE TABLE $1 (  );
.separator "\t"
.import $2 $1
