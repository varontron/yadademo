As mentioned elsewhere, <strong><em>yadademo</em></strong> derives data from 5 different datasources.

![Diagram](null)

**Performance** tab data originates in a [SQLite](http://sqlite.org) database. 

It's populated by the iPhone app [Cyclemeter](https://abvio.com/cyclemeter/).

For the purpose of the analysis, the database file is downloaded via iTunes and transferred to the server file system. 

The **YADA** implementation on the server is then configured to access it via the [Xerial SQLite JDBC driver](https://bitbucket.org/xerial/sqlite-jdbc). (A more robust solution might involve an ETL process to load the data into a conventional RDBMS.)

An advantage of [YADA](https://github.com/Novartis.com), of course, is that once a datasource is configured, its data can be accessed repeatedly via any stored query referenced simply in a URL. Here are a few examples:

The data used to populate the **View** and **Browse** tabs is derived from the URL: 

* http://host[/yada/q/CYC select runs](http://localhost:8081/yada/q/CYC select runs) (clicking on this link will retrieve the first 20 rows data in json format). 

Using the same configuration, but adding just one URL parameter (or path element) the data can be delivered as csv: 

* http://host[/yada/q/CYC select runs/f/csv](http://localhost:8081/yada/q/CYC select runs/f/csv) (clicking on this link will retrieve the first 20 rows data in cvs format)


