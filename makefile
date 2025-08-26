initpostgres:
	# adapted from
	# https://mgdm.net/weblog/postgresql-in-a-nix-shell/

	# create a database with the data stored in the current directory
	# the name of the database is 
	initdb -D .tmp/$(USER)

	# start postgresql running as the current user
	# and with the unix socket in the current directory
	pg_ctl -D .tmp/$(USER) -l postgres.log -o "--unix_socket_directories=$(PWD)" start

	# create database
	echo "creating db..."
	createdb -h $(PWD) $(USER)
startpostgres:
	pg_ctl -D .tmp/$(USER) -l postgres.log -o "--unix_socket_directories=$(PWD)" start
stoppostgres:
	pg_ctl -D .tmp/$(USER) stop -m fast
clean:
	rm -rf ./.tmp/

	# remove postgres sockets
	rm -f .s.PGSQL.5432 .s.PGSQL.5432.lock

	# optionally remove logfile
	rm -i postgres.log

