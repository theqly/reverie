import "claims_validation" as claims_validation;
import "claims_forwarding" as claims_forwarding;

fn supergraph_service(service) {
    let request_callback = |request| {
        claims_validation::process_request(request);
    };

    service.map_request(request_callback);
}

fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        claims_forwarding::process_request(request);
    };

    service.map_request(request_callback);
}