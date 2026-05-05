# Use the official Bun image as the base image "latest" or "1.2.0"
FROM oven/bun:1.3.13 AS builder

# Set the working directory to the bun directory
WORKDIR /app/bun

# Copy from the bun directory of the repo to the WORKDIR
COPY . ./

RUN bun i --no-cache && bun build --env-file=./.env --minify ./src/index.ts --outdir ./out --target=bun --env=inline

FROM oven/bun:1.3.13
WORKDIR /app/bun
# ".dockerignore" active only on first stage, so just copy out
COPY --from=builder /app/bun/out ./out
# Also copy .env to the final stage
COPY --from=builder /app/bun/.env ./.env

# Command to run the application
CMD ["bun", "./out/index.js"]
