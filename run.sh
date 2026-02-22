#!/bin/bash

# Remove container and then image, to be sure environment is fresh
docker container rm -f the_zangame_client_container
docker rmi -f the_zangame_client_image

# Build image
docker build -t the_zangame_client_image .

cd bun
# Load the .env file properly (ignores comments and empty lines)
if [ -f .env ]; then
    # Use grep to filter valid KEY=VALUE lines, then sed to trim whitespace, and xargs to export
    export $(grep -E '^[A-Z_][A-Z_0-9]*=.*$' .env | sed 's/^ *//;s/ *$//' | xargs)
    echo "Loaded .env variables successfully."
else
    echo "Warning: .env file not found. Using default PORT=5000."
    PORT=5000
fi

cd ..

# Echo the resolved command for verification
echo "Running: docker run -d -p ${VITE_CLIENT_PORT}:${VITE_CLIENT_PORT} --name the_zangame_client_container the_zangame_client_image"

# Run container. 443 is required in onrender.com for https, according to support response
docker run -d -p ${VITE_CLIENT_PORT}:${VITE_CLIENT_PORT} --name the_zangame_client_container the_zangame_client_image
