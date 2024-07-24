\echo 'Delete and recreate deadeye_laserworks db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS deadeye_laserworks;
CREATE DATABASE deadeye_laserworks;
\connect deadeye_laserworks

\i deadeye_laserworks-schema.sql
\i deadeye_laserworks-seed.sql

\echo 'Delete and recreate deadeye_laserworks_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE deadeye_laserworks_test;
CREATE DATABASE deadeye_laserworks_test;
\connect deadeye_laserworks_test

\i deadeye_laserworks-schema.sql
-- \i deadeye_laserworks-seed.sql