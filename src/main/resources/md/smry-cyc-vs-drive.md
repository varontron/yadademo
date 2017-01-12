A comparison of the distributions of elapsed time measurements of car and
cycle commuting.

Car commuting is typically faster (18 minutes faster, on median) but the range
of durations (standard deviation) is broad. Cycling is slower, but
much more consistent.  On a weekly basis, (18 min x 5 days) it takes 90 minutes longer to commute. Considering I no longer spend 3 hours per week at the gym (or getting to and from it), bicycle-commuting represents a **net-savings in time.**

Also, driving isn't going to get any more efficient, but cycling time improve through both fitness, and a lighter bike. It's one of my goals to reduce the median difference to less than 10 minutes, which would save at least an additional 40 minutes per week.

**Data Source**: Performance (SQLite)<br/>
**YADA Features**: ScriptPostprocessor Plugin, SQLiteAdaptor<br/>
**How it works**: The query [CYC select round trips](http://localhost:8081/yada/q/CYC+select+round+trips/pz/-1/c/false/pl/ScriptPostprocessor,time_pdf.py) is executed via URL. Days on which data was collected in only one direction (inbound or outbound) are omitted. Thus the dataset is exclusive to "same-day round trips," (the vast majority of data.)

The query reformats the "startTime" field to omit the time component, and then the results are grouped by date, combining "runTime" and "stoppedTime" into a total "elapsedTime" value for the day's round trip.

Before returning, the result of the query is passed to the `time_pdf.py` python script via the `ScriptPostprocessor` API, simply by including the `pl` url parameter (or path-style parameter.)  The python script separates the data into cycling and driving datasets, and then calculates a [Kernel Density Estimation (KDE)](https://en.wikipedia.org/wiki/Kernel_density_estimation) from the elapsed time measurements using [scipy.stats.gaussian_kde](https://docs.scipy.org/doc/scipy-0.18.1/reference/generated/scipy.stats.gaussian_kde.html). An array of 1000 objects containing the x and y domain values is then returned to the browser for plotting.