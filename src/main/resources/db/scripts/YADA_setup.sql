--Datasources
DELETE from YADA_QUERY_CONF where APP in ('NOAA','BLS','BLSCDB','CYC','EXP','SLP');
DELETE from YADA_QUERY where APP in ('NOAA','BLS','BLSCDB','CYC','EXP','SLP');
DELETE from YADA_UG where APP in ('NOAA','BLS','BLSCDB','CYC','EXP','SLP');

INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('BLS','https://api.bls.gov/publicAPI/v2/timeseries/data/APUA10374714?startYear=2011&endYear=');  --Gas prices
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('BLSCDB','http://localhost:5984/gas/_design');
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('NOAA','jdbcUrl=jdbc:postgresql://localhost/weather
username=yada
password=yada
autoCommit=false
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-NOAA
driverClassName=org.postgresql.Driver'); --Weather data

INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('CYC','jdbcUrl=jdbc:mysql://localhost/meter
username=yada
password=yada
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-CYC
driverClassName=com.mysql.jdbc.Driver');  --Cycling performance
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('EXP','jdbcUrl=jdbc:hsqldb:hsql://localhost/expenses
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-EXP
driverClassName=org.hsqldb.jdbc.JDBCDriver');  --Cycling expenses
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('SLP','jdbcUrl=jdbc:hsqldb:hsql://localhost/sleep
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-SLP
driverClassName=org.hsqldb.jdbc.JDBCDriver'
);  --Sleep data

-- Privs
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('NOAA','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('BLS','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('BLSCDB','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('CYC','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('EXP','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('SLP','YADA','ADMIN');

--Queries
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('BLS','BLS select to date','?i','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('BLSCDB','BLSCDB all rows','/allRows/_view/all','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('SLP','SLP select all','SELECT * FROM SLEEP','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('NOAA','NOAA select all','select to_timestamp(to_char(yr*10000+m*100+d,''99999999'')||'' ''||hr||'':00:00'',''YYYYMMDD HH24:MI:SS'')::timestamp without time zone as starttime,
round(avg(windspd),2) as windspd, round(avg(temp),2) as temp
FROM weather
group by yr, m, d, hr
order by 1 desc','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select all','SELECT * FROM RUN','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select heart rate','SELECT * FROM heartRateData','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select runs','select
case
when a.routeID = 7 then ''DO''
when a.routeID = 1 then ''DI''
when a.routeID = 2 then ''CI''
when a.routeID in (3,15,18,21,24,25,26,28) then ''CO'' end as route,
date_format(a.startTime,''%Y-%m-%d %H:%i:%S'') as startTime,
cast(a.startTime as DATE) as startDate,
date_format(a.startTime,''%Y%m'') as ym,
a.runTime, a.stoppedTime, a.runTime+a.stoppedTime as elapsedTime, a.distance, a.ascent, a.descent, a.calories
FROM run a
where a.routeId in (1,2,3,15,18,21,24,25,26,28,7)
order by a.startTime asc','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select round trips','select
case
when a.routeID = 7 then ''D''
when a.routeID = 1 then ''D''
when a.routeID = 2 then ''C''
when a.routeID in (3,15,18,21,24,25,26,28) then ''C'' end as route,
date_format(a.startTime,''%Y-%m-%d'') as date,
sum(a.runTime+a.stoppedTime)/60 as elapsedTime
FROM run a
where a.routeId in (1,2,3,15,18,21,24,25,26,28,7)
group by
date,
route
having elapsedTime > 90.0
order by date asc','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select startTime','select
date_format(startTime,''%Y-%m-%d %H:00:00'') as starttime,
sum(a.distance)/sum(a.runTime+a.stoppedTime)*2.2369362920544 as velocity
from run a
where a.routeId in (2,3,15,18,21,24,25,26,28)
group by
date_format(startTime,''%Y-%m-%d %H:00:00'')','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('EXP','EXP select all','SELECT * FROM expenses','YADABOT');

COMMIT;
--CREATE TABLE WEATHER( USAFID TEXT, WBAN TEXT, YR TEXT, M TEXT, D TEXT, HR TEXT, MIN TEXT, LAT TEXT, LONG TEXT, ELEV TEXT, WIND.DIR TEXT, WIND.SPD TEXT, TEMP TEXT, DEW.POINT TEXT, ATM.PRES TEXT, ADD TEXT, PRCP.ID TEXT, PRCP.HRS TEXT, PRCP.DPTH TEXT, PRCP.COND TEXT, PRCP.QC TEXT )
