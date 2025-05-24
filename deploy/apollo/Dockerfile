FROM debian:bullseye-slim AS installer

RUN apt-get update && apt-get install -y curl git ca-certificates

RUN curl -sSL https://rover.apollo.dev/nix/v0.31.0 | sh
ENV PATH="/root/.rover/bin:${PATH}"
ENV APOLLO_ELV2_LICENSE=accept


FROM debian:bullseye-slim AS runner

COPY --from=installer /root/.rover /root/.rover
WORKDIR /app
ENV PATH="/root/.rover/bin:${PATH}"
ENV APOLLO_ELV2_LICENSE=accept
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN rover install --plugin supergraph@=2.7.0

ENTRYPOINT ["rover"]
