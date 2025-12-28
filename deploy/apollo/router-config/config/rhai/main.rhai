import "claims_validation" as claims_validation;

fn supergraph_service(service) {
    let request_callback = |request| {
        claims_validation::process_request(request);
    };

    service.map_request(request_callback);
}
