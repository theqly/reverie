fn process_request(request) {
    let headers = request.headers;
    let secret_key = "super-secret-key-123";

    if "x-internal-secret" in headers {
        let internal_secret = headers["x-internal-secret"];

        if internal_secret == secret_key {
            return;
        }
    }

    let claims = request.context[Router.APOLLO_AUTHENTICATION_JWT_CLAIMS];

    if claims == () || !claims.contains("iss")
       || !(claims["iss"] == "http://keycloak:8080/realms/reverie-realm"
            || claims["iss"] == "http://localhost:9090/realms/reverie-realm") {
        throw #{ status: 401, message: "Unauthenticated" };
    }
}
