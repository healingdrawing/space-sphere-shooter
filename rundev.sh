#!/bin/bash

# Remove container and then image, to be sure environment is fresh
docker container rm -f the_sss_client_container
docker rmi -f the_sss_client_image

# Build image
docker build -t the_sss_client_image -f ./Dockerfile.dev .

cd bun
# Load the .env.dev file properly (ignores comments and empty lines)
if [ -f .env.dev ]; then
    # Use grep to filter valid KEY=VALUE lines, then sed to trim whitespace, and xargs to export
    export $(grep -E '^[A-Z_][A-Z_0-9]*=.*$' .env.dev | sed 's/^ *//;s/ *$//' | xargs)
    echo "Loaded .env.dev variables successfully."
else
    echo "Warning: .env.dev file not found. Using default PORT=5000."
    PORT=5000
fi

cd ..

# Echo the resolved command for verification
echo "Running: docker run -d -p ${VITE_CLIENT_PORT}:${VITE_CLIENT_PORT} --name the_sss_client_container the_sss_client_image"

# Run container. 443 is required in onrender.com for https, according to support response
docker run -d -p ${VITE_CLIENT_PORT}:${VITE_CLIENT_PORT} --name the_sss_client_container the_sss_client_image
