--Datasources
DELETE from YADA_QUERY_CONF where APP in ('NOAA','BLS','CYC','EXP','SLP');
DELETE from YADA_QUERY where APP in ('NOAA','BLS','CYC','EXP','SLP');
DELETE from YADA_UG where APP in ('NOAA','BLS','CYC','EXP','SLP');

INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('BLS','https://api.bls.gov/publicAPI/v2/timeseries/data/APUA10374714?startYear=2011&endYear=');  --Gas prices
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('NOAA','jdbcUrl=jdbc:postgresql://localhost/weather
username=yada
password=yada
autoCommit=false
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-YADA
driverClassName=org.postgresql.Driver'); --Weather data

INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('CYC','jdbcUrl=jdbc:sqlite:/Users/varonda1/Documents/workspace-git/yadademo/src/main/resources/db/Meter.db
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-YADA
driverClassName=org.sqlite.JDBC');  --Cycling performance
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('EXP','jdbcUrl=jdbc:sqlite:/Users/varonda1/Documents/workspace-git/yadademo/src/main/resources/db/Expenses.db
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-YADA
driverClassName=org.sqlite.JDBC');  --Cycling expenses
INSERT INTO YADA_QUERY_CONF (APP,CONF) VALUES ('SLP','jdbcUrl=jdbc:sqlite:/Users/varonda1/Documents/workspace-git/yadademo/src/main/resources/db/Sleep.db
autoCommit=true
connectionTimeout=300000
idleTimeout=600000
maxLifetime=1800000
minimumIdle=5
maximumPoolSize=100
poolName=HikariPool-YADA
driverClassName=org.sqlite.JDBC'
);  --Sleep data

-- Privs
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('NOAA','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('BLS','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('CYC','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('EXP','YADA','ADMIN');
INSERT INTO YADA_UG (APP,UID,ROLE) VALUES ('SLP','YADA','ADMIN');

--Queries
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('BLS','BLS select to date','?i','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('SLP','SLP select all','SELECT * FROM SLEEP','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('NOAA','NOAA select all','SELECT "M","D","YR","HR","MIN",
"WIND.SPD" as WINDSPD,
"TEMP",
"PRCP.DPTH" as PRCPDPTH
FROM WEATHER
order by "YR" desc, "M" desc, "D" desc','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select all','SELECT * FROM RUN','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select heart rate','SELECT * FROM heartRateData','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('CYC','CYC select runs','select
case
when a.routeID = 7 then ''DO''
when a.routeID = 1 then ''DI''
when a.routeID = 2 then ''CI''
when a.routeID in (3,15,18,21,24,25,26,28) then ''CO'' end as route,
datetime(a.startTime,''localtime'',''-0 hour'') as startTime,
a.runTime, a.stoppedTime, a.runTime+a.stoppedTime as elapsedTime, a.distance, a.ascent, a.descent, a.calories
FROM run a
where a.routeId in (1,2,3,15,18,21,24,25,26,28,7)
order by a.startTime asc','YADABOT');
INSERT into YADA_QUERY (app,qname,query,created_by) VALUES ('EXP','EXP select all','SELECT * FROM EXPENSES','YADABOT');

COMMIT;
--CREATE TABLE WEATHER( USAFID TEXT, WBAN TEXT, YR TEXT, M TEXT, D TEXT, HR TEXT, MIN TEXT, LAT TEXT, LONG TEXT, ELEV TEXT, WIND.DIR TEXT, WIND.SPD TEXT, TEMP TEXT, DEW.POINT TEXT, ATM.PRES TEXT, ADD TEXT, PRCP.ID TEXT, PRCP.HRS TEXT, PRCP.DPTH TEXT, PRCP.COND TEXT, PRCP.QC TEXT )
