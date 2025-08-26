# Setting up Postgres
Initialize Postgres in the current directory:
```
make initpostgres
```

Get into the Postgres command line
```
psql -h $PWD
```

In the command line, make the password
```
\password
```
Don't forget to change the DB_USER and DB_PASSWORD in .env as well

Also in the command line, grant all privileges to yourself
```
GRANT ALL PRIVILEGES ON DATABASE <user> TO <user>;
```
And then quit out of the shell

