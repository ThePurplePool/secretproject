-- infrastructure/postgres/init-databases.sql
-- Database-per-service initialization for Anti-Scam Uzbekistan microservices

CREATE DATABASE antiscam_auth;
CREATE DATABASE antiscam_users;
CREATE DATABASE antiscam_scenarios;
CREATE DATABASE antiscam_simulations;
CREATE DATABASE antiscam_progress;
CREATE DATABASE antiscam_consultant;
CREATE DATABASE antiscam_certificates;
CREATE DATABASE antiscam_fraud;
CREATE DATABASE antiscam_intelligence;
CREATE DATABASE antiscam_voice;

-- Grant permissions to standard antiscam user
GRANT ALL PRIVILEGES ON DATABASE antiscam_auth TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_users TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_scenarios TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_simulations TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_progress TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_consultant TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_certificates TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_fraud TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_intelligence TO antiscam;
GRANT ALL PRIVILEGES ON DATABASE antiscam_voice TO antiscam;
