fn process_request(request) {
    let claims = request.context[Router.APOLLO_AUTHENTICATION_JWT_CLAIMS];
    if claims == () || !claims.contains("iss") || !(claims["iss"] == "http://keycloak:8080/realms/reverie-realm" || claims["iss"] == "http://localhost:9090/realms/reverie-realm") {
        throw #{
            status: 401,
            message: "Unauthorized"
        };
    }
}