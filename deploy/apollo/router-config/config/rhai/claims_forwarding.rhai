fn process_request(request) {
    let claims = request.context[Router.APOLLO_AUTHENTICATION_JWT_CLAIMS];
    if claims ==() {
      throw #{
        status: 401
      };
    }
    let claim_names = ["x-user-id"];
    for claim_name in claim_names {
      let claim = claims[claim_name];
      claim = if claim == () {""} else {claim};
      request.subgraph.headers[claim_name] = claim;
    }
}