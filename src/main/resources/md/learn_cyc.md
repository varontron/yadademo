As mentioned elsewhere, <strong><em>yadademo</em></strong> derives data from 5 different datasources.

&lt;Insert image here&gt;

**Performance** tab data originates in a [SQLite](http://sqlite.org) database populated by the iPhone app [Cyclemeter](https://abvio.com/cyclemeter/), which, for the purpose of the demo, is downloaded via iTunes and transferred to the server file system. [YADA](https://github.com/Novartis.com) is then configured to access it via the [Xerial SQLite JDBC driver](https://bitbucket.org/xerial/sqlite-jdbc). A more robust solution might involve an ETL process to load the data into a conventional RDBMS.

An advantage of [YADA](https://github.com/Novartis.com), of course, is that once a datasource is configured, its data can be accessed repeatedly via any stored query referenced simply in a URL. Here are a few examples:

* The data used to populate the **View** and **Browse** tabs is derived from the URL: [host/yada/q/]

